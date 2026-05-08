/**
 * Fetches all 3 Hosky API feeds (rewards, metadata, metrics) **directly
 * from `hosky.io`** in the browser, merges them by `pool_id`, drops pools
 * we never want to surface (charity 100%-margin pool), and returns the
 * unified `Pool[]` shape the modal expects.
 *
 * Source-of-truth = `metadata` feed: pools without a metadata entry are
 * not curated and are skipped entirely. This also keeps logo/name/homepage
 * coupled to the canonical record.
 *
 * If hosky.io blocks the cross-origin request (missing CORS headers) or
 * returns the Vercel bot-challenge HTML, all three fetches fail silently
 * and the modal falls back to its built-in `MOCK_POOLS` list.
 */
import { useEffect, useState } from "react";
import {
    HIDDEN_POOL_IDS,
    type Pool,
} from "../components/HoskyDelegationModal";

interface RewardEntry {
    epoch: number;
    pool_id: string;
    pool_name: string;
    hoskyada: number;
    hoskynft: number;
}

interface MetadataEntry {
    metadata: {
        pool_id: string;
        ticker: string;
        name: string;
        description?: string;
        homepage?: string;
    };
    extended?: {
        url_png_icon_64x64?: string;
        url_png_logo?: string;
    };
}

interface MetricEntry {
    pool_id: string;
    active_stake: number;
    live_delegators: number;
    margin_cost: number;
    live_saturation: number;
}

interface MetricsResponse {
    metrics: MetricEntry[];
}

async function safeJson<T>(url: string): Promise<T | null> {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return (await res.json()) as T;
    } catch {
        return null;
    }
}

export interface UseHoskyPoolsResult {
    pools: Pool[];
    loading: boolean;
    error: string | null;
    reload(): void;
}

export function useHoskyPools(): UseHoskyPoolsResult {
    const [pools, setPools] = useState<Pool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        Promise.all([
            safeJson<RewardEntry[]>("https://hosky.io/api/rugpools?type=rewards"),
            safeJson<MetadataEntry[]>("https://hosky.io/api/rugpools?type=metadata"),
            safeJson<MetricsResponse>("https://hosky.io/api/stats?type=rugpoolMetrics"),
        ])
            .then(([rewards, metadata, metricsResp]) => {
                if (cancelled) return;
                if (!metadata) {
                    setError("Couldn't load Hosky pools.");
                    return;
                }

                const rewardsByPool = new Map<string, RewardEntry>();
                (rewards ?? []).forEach((r) =>
                    rewardsByPool.set(r.pool_id, r),
                );
                const metricsByPool = new Map<string, MetricEntry>();
                (metricsResp?.metrics ?? []).forEach((m) =>
                    metricsByPool.set(m.pool_id, m),
                );

                const merged: Pool[] = metadata
                    .filter((m) => !HIDDEN_POOL_IDS.has(m.metadata.pool_id))
                    .map((m) => {
                        const r = rewardsByPool.get(m.metadata.pool_id);
                        const stats = metricsByPool.get(m.metadata.pool_id);
                        return {
                            poolId: m.metadata.pool_id,
                            ticker: m.metadata.ticker,
                            name: m.metadata.name,
                            description: m.metadata.description,
                            homepage: m.metadata.homepage,
                            iconUrl:
                                m.extended?.url_png_icon_64x64 ||
                                m.extended?.url_png_logo,
                            hoskyada: r?.hoskyada ?? 0,
                            hoskynft: r?.hoskynft,
                            liveSaturation: stats?.live_saturation,
                            marginCost: stats?.margin_cost,
                            liveDelegators: stats?.live_delegators,
                        };
                    });

                setPools(merged);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [version]);

    return {
        pools,
        loading,
        error,
        reload: () => setVersion((v) => v + 1),
    };
}
