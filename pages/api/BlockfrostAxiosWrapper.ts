import axios from "axios";


const header = {headers: {'project_id': process.env.BLOCKFROST_API_KEY}};


export async function getScriptUTXOs(scriptAddress: string) {
    return axios.get(`${process.env.BLOCKFROST_BASE_URL}/addresses/${scriptAddress}/utxos`, header);
}

export async function getScriptTransactions(scriptAddress: string) {
    return axios.get(`${process.env.BLOCKFROST_BASE_URL}/addresses/${scriptAddress}/transactions`, header);
}