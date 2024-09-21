import {BrowserWallet, Data, mConStr, mConStr0, mConStr1, PlutusScript, serializePlutusScript} from "@meshsdk/core";
import DatumDTO from "../interfaces/DatumDTO";
import {Address} from "@meshsdk/core-cst";


export default class TransactionUtil {

    public static async createDatum(wallet : BrowserWallet, datumDTO : DatumDTO) : Promise<Data> {
        const address = (await wallet.getUsedAddress()).asBase();
        const paymentCredentialHash = address!.getPaymentCredential().hash.toString();
        const stakeCredentialHash = address!.getStakeCredential().hash.toString();
        const payeeCredentialHash = Address.fromString(datumDTO.payAddress)!.asBase()!.getPaymentCredential().hash.toString();
        return mConStr0(
            [
                paymentCredentialHash,
                mConStr(0,[stakeCredentialHash]),
                [
                    mConStr(0,[datumDTO.assetAmount.policyId, datumDTO.assetAmount.assetName, BigInt(datumDTO.assetAmount.amount)])
                ],
                payeeCredentialHash,
                mConStr1([]),
                datumDTO.timingDTO.startTime,
                datumDTO.timingDTO.endTime !== undefined ? mConStr0([datumDTO.timingDTO.endTime]) : mConStr1([]),
                datumDTO.timingDTO.paymentIntervalHours !== undefined ? mConStr0([BigInt(datumDTO.timingDTO.paymentIntervalHours)]) : mConStr1([]),
                datumDTO.timingDTO.maxPaymentDelayHours !== undefined ? mConStr0([datumDTO.timingDTO.maxPaymentDelayHours]) : mConStr1([]),
                BigInt(datumDTO.maxFeesLovelace)
            ]);
    }

    public static async getScriptAddressWithStakeCredential(wallet : BrowserWallet, script : PlutusScript) : Promise<string> {
        const address = (await wallet.getUsedAddress()).asBase();
        const stakeCredentialHash = address!.getStakeCredential().hash.toString();
        const networkID = await wallet.getNetworkId();
        return serializePlutusScript(script, stakeCredentialHash, networkID, false).address;
    }
}