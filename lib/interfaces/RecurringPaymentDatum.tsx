import AssetAmount from "./AssetAmount";
import Timing from "./Timing";

export default interface RecurringPaymentDatum {
    owner: string;
    amountToSend: AssetAmount[];
    payee: string;
    startTime: number;
    endTime?: number;
    paymentIntervalHours?: number;
    maxPaymentDelayHours?: number;
    maxFeesLovelace: number;
}