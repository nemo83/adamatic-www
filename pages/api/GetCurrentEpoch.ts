import type {NextApiRequest, NextApiResponse} from "next";
import axios from "axios";

interface Data {
    epoch: number;
    startTimestamp: number;
}

interface EpochResponse {
    epoch: number;
    start_time: number;
    end_time: number;
}

const header = {headers: {'project_id': process.env.BLOCKFROST_API_KEY}};
/**
 * Returns the current slot.
 * @param req
 * @param res number of absolute slot
 */
export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
) {
    // @ts-ignore
    axios.get<EpochResponse>(`${process.env.BLOCKFROST_BASE_URL}/epochs/latest`, header).then((response) => {
        res.status(200).json({epoch: response.data.epoch, startTimestamp: response.data.start_time});
    });

}