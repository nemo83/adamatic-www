import type { AssetAmount } from "./AssetAmount";

/**
 * Form-level shape of the on-chain `AutomatedPayment` datum, before adapter
 * encoding. Matches the Aiken `AutomatedPayment { owner_pkh, amount_to_send,
 * payee, start_time, end_time, payment_interval_hours, max_payment_delay_hours,
 * max_fees_lovelace }` field-for-field.
 */
export interface RecurringPaymentDatum {
    ownerPaymentPubKeyHash: string;
    amountToSend: AssetAmount[];
    payee: string;
    startTime: number;
    endTime?: number;
    paymentIntervalHours?: number;
    maxPaymentDelayHours?: number;
    maxFeesLovelace: number;
}

export default RecurringPaymentDatum;
