import dayjs from "dayjs";
import AssetAmount from "./AssetAmount";

export default interface RecurringPayment {
    txHash: string,
    output_index: number,
    balance: AssetAmount[],
    amountToSend: AssetAmount[];
    payee: string,
    startTime: dayjs.Dayjs;
    endTime: dayjs.Dayjs | undefined;
    paymentIntervalHours: number | undefined;
    maxPaymentDelayHours: number | undefined;
    maxFeesLovelace: number;
}