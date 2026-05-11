/**
 * CoinGecko price client. Public API; CORS-enabled; no auth required.
 * Cached per-session in module-level memo to avoid hammering on every render.
 */

const HOSKY_SLUG = "hosky";
let cached: { price: number; ts: number } | null = null;
const TTL_MS = 5 * 60 * 1000;

/**
 * Fetch the latest HOSKY/USD price. Returns null if CoinGecko is
 * unreachable or returns no value (caller can show "—").
 */
export async function fetchHoskyPriceUsd(): Promise<number | null> {
    if (cached && Date.now() - cached.ts < TTL_MS) return cached.price;
    try {
        const res = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${HOSKY_SLUG}&vs_currencies=usd`,
        );
        if (!res.ok) return null;
        const json = (await res.json()) as Record<string, { usd?: number }>;
        const price = json?.[HOSKY_SLUG]?.usd ?? null;
        if (price !== null && price !== undefined) {
            cached = { price, ts: Date.now() };
            return price;
        }
        return null;
    } catch {
        return null;
    }
}
