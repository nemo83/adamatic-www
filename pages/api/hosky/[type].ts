/**
 * Server-side proxy for hosky.io's public API.
 *
 * Why: hosky.io is gated by Vercel's bot challenge (JS-based, not header-based)
 * AND doesn't send CORS headers, so cross-origin browser fetches from
 * adamatic.xyz fail. Server-to-server fetches with a realistic UA usually
 * pass — and the response is JSON we can hand straight to the FE.
 *
 * Mapping:
 *   /api/hosky/rewards       → GET https://hosky.io/api/rugpools?type=rewards
 *   /api/hosky/metadata      → GET https://hosky.io/api/rugpools?type=metadata
 *   /api/hosky/metrics       → GET https://hosky.io/api/stats?type=rugpoolMetrics
 *
 * Cached for 60 seconds at the edge so repeated opens of the modal don't
 * hammer the upstream — these endpoints update once per epoch (~5 days).
 */
import type { NextApiRequest, NextApiResponse } from "next";

const UPSTREAM: Record<string, string> = {
    rewards: "https://hosky.io/api/rugpools?type=rewards",
    metadata: "https://hosky.io/api/rugpools?type=metadata",
    metrics: "https://hosky.io/api/stats?type=rugpoolMetrics",
};

const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    Accept: "application/json, */*",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://hosky.io/rugpools",
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const type = String(req.query.type ?? "");
    const url = UPSTREAM[type];
    if (!url) {
        res.status(404).json({ error: `Unknown type "${type}"` });
        return;
    }

    try {
        const upstream = await fetch(url, { headers: HEADERS });
        if (!upstream.ok) {
            res.status(upstream.status).json({
                error: `Upstream HTTP ${upstream.status}`,
            });
            return;
        }
        const body = await upstream.text();
        res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.status(200).send(body);
    } catch (err) {
        res.status(502).json({
            error: "Proxy failed",
            detail: err instanceof Error ? err.message : String(err),
        });
    }
}
