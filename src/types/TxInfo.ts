export interface Amount {
    quantity: string;
    unit: string;
}

export interface TxInfo {
    tx_hash: string;
    tx_datum: string;
    output_index: number;
    amount: Amount[];
}

export default TxInfo;
