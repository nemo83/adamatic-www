import type {NextApiRequest, NextApiResponse} from "next";
import {BlockfrostProvider, BlockInfo} from "@meshsdk/core";

// @ts-ignore


interface Data {
    slot: number;
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
) {
    // @ts-ignore
    const blockfrostProvider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY)
    blockfrostProvider.fetchLatestBlock().then((block : BlockInfo) => {
            res.status(200).json({slot : +block.slot});
    });
}