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
import { BLOCKFROST_API_KEY, CONSTANTS, SCRIPT, SETTINGS_OUTPUT_INDEX, SETTINGS_TX_HASH } from "./Constants";
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

    public static createDatum(datumDTO: RecurringPaymentDatum): Data {

        if (datumDTO.ownerPaymentPubKeyHash === "" || datumDTO.payee === "") {
            throw new Error("Missing ownerPaymentPubKeyHash or payee");
        }

        const payee = Address.fromBech32(datumDTO.payee);

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

    }

    public static toOnchainAddress(address: Address): Data {

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

    }

    public static async getUnsignedCancelTx(recurringPaymentDTOs: RecurringPayment[], wallet: IWallet): Promise<string> {

        const baseAddress = Address.fromBech32((await wallet.getUsedAddresses())[0]);

        const walletAddress = baseAddress.toBech32().toString();

        const walletPkh = baseAddress.asBase()!.getPaymentCredential().hash.toString();
        console.log('walletPkh: ' + walletPkh)

        const walletUtxos = (await wallet.getUtxos()).filter((utxo) => utxo.output.address == walletAddress);

        let collateralUtxos = (await wallet.getCollateral()).filter((utxo) => utxo.output.address == walletAddress);

        if (collateralUtxos.length == 0) {
            collateralUtxos = walletUtxos.filter((utxo) => utxo.output.amount.length == 1);
        }

        if (collateralUtxos.length == 0) {
            return Promise.reject('Wallet has no available collateral, please set it in the wallet, or send additional 5 ada to the current wallet address');
        }

        txBuilder.reset();

        for (const recurringPaymentDTO of recurringPaymentDTOs) {
            txBuilder.spendingPlutusScriptV3()
                .txIn(recurringPaymentDTO.txHash, recurringPaymentDTO.output_index)
                .txInInlineDatumPresent()
                .txInRedeemerValue(mConStr(0, []))
                .spendingTxInReference(SETTINGS_TX_HASH, SETTINGS_OUTPUT_INDEX);
        }

        return txBuilder
            .changeAddress(walletAddress)
            .txInCollateral(collateralUtxos[0].input.txHash, collateralUtxos[0].input.outputIndex)
            .selectUtxosFrom(walletUtxos)
            .requiredSignerHash(walletPkh)
            .complete();

    }

    public static async getScriptAddressWithStakeCredential(wallet: IWallet, script: PlutusScript, walletFrom: string): Promise<string> {

        const addressFrom = Address.fromBech32(walletFrom);
        let stakeCredentialHash: string;
        switch (addressFrom.getType()) {
            case AddressType.BasePaymentKeyStakeKey:
            case AddressType.BasePaymentScriptStakeKey:
                stakeCredentialHash = addressFrom.asBase()!.getStakeCredential().hash.toString();
                break;
            case AddressType.RewardKey:
                stakeCredentialHash = addressFrom.asReward()!.getPaymentCredential().hash.toString();
                break;
            default:
                return Promise.reject('Unsupported address');
        }

        return wallet
            .getNetworkId()
            .then((networkId) => serializePlutusScript(script, stakeCredentialHash, networkId, false).address);

    }

    public static getSuggestedFees(numPayments: number, amountToSend = 2000000): number {
        return numPayments * (amountToSend + CONSTANTS.SUGGESTED_TX_FEE * CONSTANTS.CUT)
    }
}