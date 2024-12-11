import AssetAmount from "./AssetAmount";

export default interface RecurringPaymentDatum {
    ownerPaymentPubKeyHash: string;
    amountToSend: AssetAmount[];
    payee: string;
    startTime: number;
    endTime?: number;
    paymentIntervalHours?: number;
    maxPaymentDelayHours?: number;
    maxFeesLovelace: number;
}