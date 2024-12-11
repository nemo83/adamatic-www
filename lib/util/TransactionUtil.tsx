import {
    BrowserWallet,
    Data,
    IWallet,
    MaestroProvider,
    mConStr,
    mConStr0,
    mConStr1,
    MeshTxBuilder,
    PlutusScript,
    serializePlutusScript
} from "@meshsdk/core";
import RecurringPaymentDatum from "../interfaces/RecurringPaymentDatum";
import { Address, AddressType } from "@meshsdk/core-cst";
import RecurringPayment from "../interfaces/RecurringPayment";
import { BLOCKFROST_API_KEY, CONSTANTS, SCRIPT } from "./Constants";
import { BlockfrostProvider } from "@meshsdk/core";

class BlockfrostProviderSingleton {

    private static instance: BlockfrostProvider;

    private constructor() { }

    public static getInstance(): BlockfrostProvider {
        if (!BlockfrostProviderSingleton.instance) {
            BlockfrostProviderSingleton.instance = new BlockfrostProvider(BLOCKFROST_API_KEY!);
        }
        return BlockfrostProviderSingleton.instance;
    }

}

const blockchainProvider = BlockfrostProviderSingleton.getInstance();

class TxBuilderSingleton {

    private static instance: MeshTxBuilder;

    private constructor() { }

    public static getInstance(): MeshTxBuilder {
        if (!TxBuilderSingleton.instance) {
            TxBuilderSingleton.instance = new MeshTxBuilder({
                fetcher: blockchainProvider,
                evaluator: blockchainProvider
            });
            TxBuilderSingleton.instance.setNetwork("mainnet");
        }
        return TxBuilderSingleton.instance;
    }

}

const txBuilder = TxBuilderSingleton.getInstance();

export default class TransactionUtil {

    public static async createDatum(datumDTO: RecurringPaymentDatum): Promise<Data> {

        try {

            if (datumDTO.ownerPaymentPubKeyHash === "" || datumDTO.payee === "") {
                return mConStr(0, [])
            }

            const payee = Address.fromBech32(datumDTO.payee);

            let payeeCredentialHash;
            try {
                payeeCredentialHash = datumDTO.payee ? Address.fromString(datumDTO.payee)!.asBase()!.getPaymentCredential().hash.toString() : "";
            } catch (TypeError) {
                payeeCredentialHash = "ERROR: Wrong Payee Address!";
            }

            return mConStr0(
                [
                    datumDTO.ownerPaymentPubKeyHash,
                    [
                        // TODO currently it's only possible to send one asset, could be extended in the future
                        mConStr(0, datumDTO.amountToSend.length > 0 ? [datumDTO.amountToSend[0].policyId, datumDTO.amountToSend[0].assetName, BigInt(datumDTO.amountToSend[0].amount)] : []) // 2
                    ],
                    TransactionUtil.toOnchainAddress(payee),
                    BigInt(datumDTO.startTime), // 5
                    datumDTO.endTime !== undefined ? mConStr0([datumDTO.endTime]) : mConStr1([]), //6
                    datumDTO.paymentIntervalHours !== undefined ? mConStr0([BigInt(datumDTO.paymentIntervalHours)]) : mConStr1([]), // 7
                    datumDTO.maxPaymentDelayHours !== undefined ? mConStr0([datumDTO.maxPaymentDelayHours]) : mConStr1([]), // 8
                    BigInt(datumDTO.maxFeesLovelace) // 9
                ]
            );
        } catch (error) {
            console.error('could not create datum' + error);
            return mConStr(0, []);
        }
    }

    public static toOnchainAddress(address: Address): Data {
        try {
            const addressType = address.getType();

            let paymentCredentialHash = "";
            let stakeCredentialHashOpt = "";
            switch (address.getType()) {
                case AddressType.BasePaymentKeyStakeKey:
                case AddressType.BasePaymentScriptStakeKey:
                case AddressType.BasePaymentKeyStakeScript:
                case AddressType.BasePaymentScriptStakeScript:
                    const baseAddress = address.asBase()!;
                    paymentCredentialHash = baseAddress.getPaymentCredential().hash.toString();
                    stakeCredentialHashOpt = baseAddress.getStakeCredential().hash.toString();
                    break;
                case AddressType.EnterpriseKey:
                case AddressType.EnterpriseScript:
                    const enterpriseAddress = address.asEnterprise()!;
                    paymentCredentialHash = enterpriseAddress.getPaymentCredential().hash.toString();
                    break;
                default:
                // code block
            }

            return mConStr(0, [
                mConStr(0, [paymentCredentialHash]),
                stakeCredentialHashOpt ? mConStr(0, [mConStr(0, [mConStr(0, [stakeCredentialHashOpt])])]) : mConStr(1, []),
            ]);
        } catch (error) {
            console.error('could not create onchain address' + error);
            return mConStr(0, []);
        }

    }

    public static async getUnsignedCancelTx(recurringPaymentDTO: RecurringPayment, wallet: IWallet): Promise<string> {

        const baseAddress = Address.fromBech32((await wallet.getUsedAddresses())[0]);

        const walletAddress = baseAddress.toBech32().toString();

        const walletPkh = baseAddress.asBase()!.getPaymentCredential().hash.toString();
        console.log('walletPkh: ' + walletPkh)

        const collateral = (await wallet.getCollateral()).filter((utxo) => utxo.output.address == walletAddress);

        const walletUtxos = (await wallet.getUtxos()).filter((utxo) => utxo.output.address == walletAddress);

        const protocolParams = await blockchainProvider.fetchProtocolParameters();

        const utxos = await blockchainProvider.fetchUTxOs(recurringPaymentDTO.txHash, recurringPaymentDTO.output_index);

        txBuilder.reset();

        return txBuilder
            // .setNetwork('mainnet')
            .spendingPlutusScriptV3()
            .txIn(recurringPaymentDTO.txHash, recurringPaymentDTO.output_index, utxos[0].output.amount, utxos[0].output.address)
            .txInInlineDatumPresent()
            .txInRedeemerValue(mConStr(0, []))
            .spendingTxInReference("4eb4d38a4006a8524c811fbac0f6b5d414f9a31c5ff83856dcd991b3bc63b0e5", 0)
            .changeAddress(walletAddress)
            .txInCollateral(collateral[0].input.txHash, collateral[0].input.outputIndex)
            .selectUtxosFrom(walletUtxos)
            .requiredSignerHash(walletPkh)
            .complete();

    }

    public static async getScriptAddressWithStakeCredential(wallet: IWallet, script: PlutusScript, walletFrom: string): Promise<string> {
        const addressFrom = Address.fromBech32(walletFrom);
        // const address = (await wallet.getUsedAddress()).asBase();
        // const stakeCredentialHash = address!.getStakeCredential().hash.toString();
        const stakeCredentialHash = addressFrom.asBase()!.getStakeCredential().hash.toString();
        const networkID = await wallet.getNetworkId();

        return serializePlutusScript(script, stakeCredentialHash, networkID, false).address;
    }

    public static getSuggestedFees(numPayments: number, amountToSend = 2000000): number {
        return numPayments * (amountToSend + CONSTANTS.SUGGESTED_TX_FEE * CONSTANTS.CUT)
    }
}