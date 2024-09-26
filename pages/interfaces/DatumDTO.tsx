import AssetAmount from "./AssetAmount";
import TimingDTO from "./TimingDTO";

export default interface DatumDTO {
    amountToDeposit: number;
    assetAmounts: AssetAmount[];
    payAddress: string;
    startTime: number;
    endTime?: number;
    paymentIntervalHours?: number;
    maxPaymentDelayHours?: number;
    maxFeesLovelace: number;
}