// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {BlockfrostProvider} from "@meshsdk/core";
import axios from "axios";
import GetScriptTransactionsResponse from "../../lib/interfaces/GetScriptTransactionsResponse";


type Data = {
    utxo: string;
};

interface BlockfrostTxInfo {
    output_index: number;
    inline_datum: string;
    amount: {unit: string, quantity: string}[];
    consumed_by_tx: string | null;
}



const header = {headers: {'project_id': process.env.BLOCKFROST_API_KEY}};


async function getTxUtxos(txHash: string) {
    return axios.get<{outputs: BlockfrostTxInfo[]}>(`${process.env.BLOCKFROST_BASE_URL}/txs/${txHash}/utxos`, header);
}

async function getScriptTransactions(scriptAddress: string) {
    return axios.get(`${process.env.BLOCKFROST_BASE_URL}/addresses/${scriptAddress}/transactions`, header);
}

async function fetchAddressTransaction(scriptAddress: string) {
    const data : GetScriptTransactionsResponse[] = [];
    const scriptTransactions = await getScriptTransactions(scriptAddress);
    for (const tx of scriptTransactions.data) {
        const transactionUTxos = await getTxUtxos(tx.tx_hash);
        transactionUTxos.data.outputs.filter((output) => output.inline_datum && output.consumed_by_tx === null).forEach((output) => {
            data.push({tx_hash: tx.tx_hash, output_index: output.output_index, tx_datum: output.inline_datum, amount: output.amount});
        });
    }
    return data;
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
) {

    const scriptAddress = req.body;
    fetchAddressTransaction(scriptAddress).then((data) => {
        console.log(data)
        res.status(200).json({utxo: JSON.stringify(data)});
    });
}

