import AssetAmount from "./AssetAmount";

export interface HoskyTemplate {
    amount_to_send: AssetAmount[];
    suggested_deposit: AssetAmount[];
    payee_address: string;
    epoch_start: number;
    epoch_end: number;
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
