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
