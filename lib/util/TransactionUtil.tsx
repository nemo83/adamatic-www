import {
    BrowserWallet,
    Data, deserializeDatum, hexToString,
    mConStr,
    mConStr0,
    mConStr1,
    PlutusScript,
    resolvePlutusScriptAddress,
    serializePlutusScript, Transaction, UTxO
} from "@meshsdk/core";
import RecurringPaymentDatum from "../interfaces/RecurringPaymentDatum";
import { Address, AddressType } from "@meshsdk/core-cst";
import RecurringPayment from "../interfaces/RecurringPayment";
import AssetAmount from "../interfaces/AssetAmount";
import TxInfo from "../interfaces/TxInfo";
import { CONSTANTS, SCRIPT } from "./Constants";


export default class TransactionUtil {

    public static async createDatum(wallet: BrowserWallet, datumDTO: RecurringPaymentDatum): Promise<Data> {

        try {

            console.log('datum: ' + JSON.stringify(datumDTO));

            if (datumDTO.owner === "" || datumDTO.payee === "") {
                return mConStr(0, [])
            }

            const owner = Address.fromBech32(datumDTO.owner);
            const payee = Address.fromBech32(datumDTO.payee);

            let payeeCredentialHash;
            try {
                payeeCredentialHash = datumDTO.payee ? Address.fromString(datumDTO.payee)!.asBase()!.getPaymentCredential().hash.toString() : "";
            } catch (TypeError) {
                payeeCredentialHash = "ERROR: Wrong Payee Address!";
            }

            return mConStr0(
                [
                    TransactionUtil.toOnchainAddress(owner),
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
            console.log('address: ' + address.toBech32().toString());
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
                mConStr(0, [mConStr(0, [stakeCredentialHashOpt ? mConStr(0, [stakeCredentialHashOpt]) : mConStr(1, [])])]),
            ]);
        } catch (error) {
            console.error('could not create onchain address' + error);
            return mConStr(0, []);
        }

    }

    public static deserializeDatum(utxo: TxInfo): RecurringPayment {
        const datum = deserializeDatum(utxo.tx_datum);
        let amountToSend: AssetAmount[] = [];
        for (let i = 0; i < datum.fields[2].length; i++) {
            amountToSend.push({
                policyId: datum.fields[2][i].fields[0],
                assetName: datum.fields[2][i].fields[1],
                amount: datum.fields[2][i].fields[2]
            } as AssetAmount);
        }
        return {
            txHash: utxo.tx_hash,
            output_index: utxo.output_index,
            amounts: utxo.amount,
            ownerPaymentPkh: datum.fields[0].bytes,
            ownerStakePkh: datum.fields[1].constructor === 0 ? datum.fields[1].fields[0].bytes : undefined,
            amountToSend: amountToSend,
            payeePaymentPkh: datum.fields[3].bytes,
            payeeStakePkh: datum.fields[4].constructor === 0 ? datum.fields[4].fields[0].bytes : undefined,
            startTime: new Date(datum.fields[5].int),
            endTime: datum.fields[6].constructor === 0 ? datum.fields[6].fields[0] : undefined,
            paymentIntervalHours: datum.fields[7].constructor === 0 ? datum.fields[7].fields[0] : undefined,
            maxPaymentDelayHours: datum.fields[8].constructor === 0 ? datum.fields[8].fields[0] : undefined,
            maxFeesLovelace: datum.fields[9].int
        }

    }

    public static async getUnsignedCancelTx(recurringPaymentDTO: RecurringPayment, scriptAddress: string, wallet: BrowserWallet): Promise<Transaction> {
        const utxo: UTxO =
        {
            input: {
                txHash: recurringPaymentDTO.txHash,
                outputIndex: recurringPaymentDTO.output_index
            },
            output: {
                address: scriptAddress,
                amount: recurringPaymentDTO.amounts
            }
        }
        const response = await fetch('api/GetCurrentSlot');
        const slot: number = (await response.json()).slot;
        return new Transaction({ initiator: wallet })
            .setRequiredSigners([(await wallet.getUsedAddress()).toBech32().toString()])
            .setTimeToStart('' + slot)
            .setTimeToExpire('' + (slot + 200))
            .redeemValue({
                value: utxo
                ,
                script: SCRIPT,
                redeemer: {
                    data: mConStr0([])
                }
            });
    }

    public static async getScriptAddressWithStakeCredential(wallet: BrowserWallet, script: PlutusScript): Promise<string> {
        const address = (await wallet.getUsedAddress()).asBase();
        const stakeCredentialHash = address!.getStakeCredential().hash.toString();
        const networkID = await wallet.getNetworkId();

        return serializePlutusScript(script, stakeCredentialHash, networkID, false).address;
    }

    public static getSuggestedFees(numPayments: number, amountToSend = 2000000): number {
        return numPayments * (amountToSend + CONSTANTS.SUGGESTED_TX_FEE * CONSTANTS.CUT)
    }
}