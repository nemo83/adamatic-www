import AssetAmount from "./AssetAmount";
import TimingDTO from "./TimingDTO";

export default interface DatumDTO {
    assetAmount: AssetAmount;
    payAddress: string;
    timingDTO: TimingDTO;
    maxFeesLovelace: number;
}