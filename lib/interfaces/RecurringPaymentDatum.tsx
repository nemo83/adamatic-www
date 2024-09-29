import AssetAmount from "./AssetAmount";
import Timing from "./Timing";

export default interface RecurringPaymentDatum {
    amountToDeposit: number;
    assetAmounts: AssetAmount[];
    payAddress: string;
    startTime: number;
    endTime?: number;
    paymentIntervalHours?: number;
    maxPaymentDelayHours?: number;
    maxFeesLovelace: number;
}