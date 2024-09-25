import AssetAmount from "./AssetAmount";
import TimingDTO from "./TimingDTO";

export default interface DatumDTO {
    amountToDeposit: number;
    assetAmount: AssetAmount;
    payAddress: string;
    timingDTO: TimingDTO;
    maxFeesLovelace: number;
}