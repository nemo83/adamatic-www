import type { Dayjs } from "dayjs";
import type { AssetAmount } from "./AssetAmount";

export interface RecurringPayment {
    txHash: string;
    output_index: number;
    staking_address: string;
    balance: AssetAmount[];
    amountToSend: AssetAmount[];
    payee: string;
    startTime: Dayjs;
    endTime: Dayjs | undefined;
    paymentIntervalHours: number | undefined;
    maxPaymentDelayHours: number | undefined;
    paymentStatus: string;
}

export default RecurringPayment;
