import AssetAmount from "./AssetAmount";

export default interface RecurringPaymentDTO {
    txHash: string,
    output_index: number,
    amounts: {quantity: string, unit : string}[],
    ownerPaymentPkh: string;
    ownerStakePkh: string | undefined;
    amountToSend: AssetAmount[];
    payeePaymentPkh: string;
    payeeStakePkh: string | undefined;
    startTime: Date;
    endTime: number | undefined;
    paymentIntervalHours: number | undefined;
    maxPaymentDelayHours: number | undefined;
    maxFeesLovelace: number;
}