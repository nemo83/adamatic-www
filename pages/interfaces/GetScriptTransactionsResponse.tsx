export default interface GetScriptTransactionsResponse {
    tx_hash: string;
    tx_datum: string;
    output_index: number;
    amount: Amount[];
}

export interface Amount {
    quantity: string;
    unit: string;
}