import type { AssetAmount } from "./AssetAmount";

export interface HoskyTemplate {
    amount_to_send: AssetAmount[];
    suggested_deposit: AssetAmount[];
    max_fee_lovelaces: number;
    payee_address: string;
    epoch_start: number;
    epoch_end: number;
    lock_end_time: boolean;
    start_time_timestamp: number;
    end_time_timestamp: number;
    payment_interval_hours: number;
    epoch_frequency: number;
}

export interface TransactionDetail {
    timestamp: number;
    transaction_type: string;
    tx_hash: string | undefined;
    balance: AssetAmount;
}

export interface PaymentDetails {
    from: string;
    to: string;
    amount: AssetAmount;
    num_pulls: number;
    epoch_interval: number;
    initial_deposit: AssetAmount;
    max_fee: number;
    epoch_start: number;
    epoch_end: number;
    transactions: TransactionDetail[];
}

export interface Settings {
    settings_adming_pks: string;
    authorised_operators: string[];
    operator_fee_exempt_users: string[];
    operator_fee_lovelace: number;
    base_fee_lovelace: number;
}

export interface AdaMaticStats {
    /** Sum of lovelace currently locked in active recurring payments.
     *  String (not number) because lovelace totals can exceed JS's safe-int
     *  range for big networks — parse with BigInt where exact math matters. */
    tvl_lovelace: string;
    /** Count of active payments (SCHEDULED | INSUFFICIENT_FUNDS). */
    scheduled_count: number;
    /** All-time count of executed payments. */
    executed_count: number;
}
