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
import {Address} from "@meshsdk/core-cst";
import {applyCborEncoding} from "@meshsdk/core-csl";
import RecurringPayment from "../interfaces/RecurringPayment";
import AssetAmount from "../interfaces/AssetAmount";
import {bytesToString} from "@scure/base";
import {string} from "prop-types";
import {hexToNumber} from "@harmoniclabs/crypto/dist/noble/abstract/utils";
import TxInfo from "../interfaces/TxInfo";
import {CONSTANTS, SCRIPT} from "./Constants";


export default class TransactionUtil {

    public static async createDatum(wallet : BrowserWallet, datumDTO : RecurringPaymentDatum) : Promise<Data> {
        console.log(wallet)
        const address = (await wallet.getUsedAddress()).asBase();
        const paymentCredentialHash = address!.getPaymentCredential().hash.toString();
        const stakeCredentialHash = address!.getStakeCredential().hash.toString();
        let payeeCredentialHash;
        try {
            payeeCredentialHash = datumDTO.payAddress ? Address.fromString(datumDTO.payAddress)!.asBase()!.getPaymentCredential().hash.toString() : "";
        } catch (TypeError) {
            payeeCredentialHash = "ERROR: Wrong Payee Address!";
        }

        return mConStr0(
            [
                paymentCredentialHash, // 0
                mConStr(0,[stakeCredentialHash]), // 1
                [
                    // TODO currently it's only possible to send one asset, could be extended in the future
                    mConStr(0,datumDTO.assetAmounts.length > 0 ? [ datumDTO.assetAmounts[0].policyId, datumDTO.assetAmounts[0].assetName, BigInt(datumDTO.assetAmounts[0].amount)] : []) // 2
                ],
                payeeCredentialHash, // 3
                mConStr1([]), // 4
                BigInt(datumDTO.startTime), // 5
                datumDTO.endTime !== undefined ? mConStr0([datumDTO.endTime]) : mConStr1([]), //6
                datumDTO.paymentIntervalHours !== undefined ? mConStr0([BigInt(datumDTO.paymentIntervalHours)]) : mConStr1([]), // 7
                datumDTO.maxPaymentDelayHours !== undefined ? mConStr0([datumDTO.maxPaymentDelayHours]) : mConStr1([]), // 8
                BigInt(datumDTO.maxFeesLovelace) // 9
            ]
        );
    }

    public static deserializeDatum(utxo : TxInfo) : RecurringPayment {
        const datum = deserializeDatum(utxo.tx_datum);
        let amountToSend : AssetAmount[] = [];
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

    public static async getUnsignedCancelTx(recurringPaymentDTO : RecurringPayment, scriptAddress : string, wallet : BrowserWallet) : Promise<Transaction> {
        const utxo : UTxO =
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
        const slot : number = (await response.json()).slot;
        return new Transaction({initiator: wallet})
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

    public static async getScriptAddressWithStakeCredential(wallet : BrowserWallet, script : PlutusScript) : Promise<string> {
        const address = (await wallet.getUsedAddress()).asBase();
        const stakeCredentialHash = address!.getStakeCredential().hash.toString();
        const networkID = await wallet.getNetworkId();

        return serializePlutusScript(script, stakeCredentialHash, networkID, false).address;
    }

    public static getSuggestedFees(numPayments : number, amountToSend = 2000000) : number {
        return numPayments * (amountToSend + CONSTANTS.SUGGESTED_TX_FEE * CONSTANTS.CUT)
    }
}