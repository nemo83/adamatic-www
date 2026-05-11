/**
 * Canonical list of Hosky-affiliated rugpools we surface in the FE.
 *
 * Mirrors what hosky.io's `/api/rugpools?type=metadata` returns, with the
 * `hoskyada` rate from `?type=rewards` and the saturation/fee/delegators
 * from `/api/stats?type=rugpoolMetrics`. Refresh manually when those feeds
 * shift (rates change every epoch; metadata changes rarely).
 *
 * WRFGS is intentionally omitted — 100% margin charity pool, not suitable
 * for a "delegate to earn HOSKY" flow.
 */

export interface CuratedPool {
    /** Bech32 pool id (`pool1...`). */
    poolId: string;
    /** Hex pool hash (28 bytes / 56 chars). */
    poolHex: string;
    /** Pool ticker, uppercase. */
    ticker: string;
    name: string;
    description?: string;
    homepage?: string;
    iconUrl?: string;
    /** HOSKY per ADA per epoch. */
    hoskyada: number;
    hoskynft?: number;
    liveSaturation?: number;
    marginCost?: number;
    liveDelegators?: number;
}

export const HOSKY_POOL_ID =
    "pool19m98gdj84d4kxem5h6ch8fvj92pvauhg0y4ktmzr3mln6c45yly";
export const EASY1_POOL_ID =
    "pool1yr0cv3dtmhcfgqa6yetvmf769ngk89e6tepecmjrmjl2jzcw2lm";

/** Pools we never surface. WRFGS = UNHCR charity, 100% margin. */
export const HIDDEN_POOL_IDS = new Set<string>([
    "pool1dmnyhw9uthknzcq4q6pwdc4vtfxz5zzrvd9eg432u60lzl959tw",
]);

export const CURATED_POOLS: CuratedPool[] = [
    {
        poolId: HOSKY_POOL_ID,
        poolHex: "2eca743647ab6b636774beb173a5922a82cef2e8792b65ec438eff3d",
        ticker: "HOSKY",
        name: "HOSKY",
        description: "Explicitly priceless since 2021.",
        iconUrl: "https://cdn.hosky.io/icons/hosky-icon-64.png",
        homepage: "https://hosky.io/",
        hoskyada: 7728,
        hoskynft: 797,
        liveSaturation: 0.033,
        marginCost: 0.0269,
        liveDelegators: 84,
    },
    {
        poolId: EASY1_POOL_ID,
        poolHex: "20df8645abddf09403ba2656cda7da2cd163973a5e439c6e43dcbea9",
        ticker: "EASY1",
        name: "easy1staking.com",
        description: "Built AdaMatic. Run a pretty tidy stake pool too.",
        iconUrl:
            "https://raw.githubusercontent.com/speedwing/easy1-stakepool/main/img/easy1-64x64.png",
        homepage: "https://easy1staking.com",
        hoskyada: 243,
        hoskynft: 549,
        liveSaturation: 0.404,
        marginCost: 0,
        liveDelegators: 1172,
    },
    {
        poolId: "pool1jv4yvr5edp7qp690hk3qfudwmw28n2wygjxyhaecqkzeqh0wlem",
        poolHex: "932a460e99687c00e8afbda204f1aedb9479a9c4448c4bf738058590",
        ticker: "WEED",
        name: "CardanoWeed",
        iconUrl: "https://i.postimg.cc/Hk4xh8kb/Cardano420-WEED-Logo.jpg",
        homepage: "https://cardano420.com",
        hoskyada: 3796,
        liveSaturation: 0.014,
        marginCost: 0,
        liveDelegators: 494,
    },
    {
        poolId: "pool1j742gcsul7u8c05rsqmkgpkvj5qadj0pew69nctu6crqy9wjjn4",
        poolHex: "97aaa4621cffb87c3e8380376406cc9501d6c9e1cbb459e17cd60602",
        ticker: "BONE",
        name: "BONE pool",
        hoskyada: 3787,
        liveSaturation: 0.019,
        marginCost: 0.01,
        liveDelegators: 327,
    },
    {
        poolId: "pool1zkdaju2rjefa52uh6yh6etsxla0x6aqs6p6wm245y5szk7k3msd",
        poolHex: "159bd971439653da2b97d12facae06ff5e6d7410d074edaab425202b",
        ticker: "A3C",
        name: "A3C Pool",
        hoskyada: 3419,
        liveSaturation: 0.02,
        marginCost: 0.025,
        liveDelegators: 639,
    },
    {
        poolId: "pool1c2utlagkpht4zj0jetsf245c258geuxnjqp9kf4f2z9rutx9dz4",
        poolHex: "c2b8bff5160dd75149f2cae0955698550e8cf0d390025b26a9508a3e",
        ticker: "QCPOL",
        name: "Québec / Canada Hosky ISPO",
        iconUrl: "https://qcpol.stakepool.quebec/qcpol_logo_64.png",
        homepage: "https://qcpol.stakepool.quebec",
        hoskyada: 2407,
        liveSaturation: 0.0236,
        marginCost: 0.05,
        liveDelegators: 442,
    },
    {
        poolId: "pool1a2gt2mvuf5zvtqlvw2xgks2efze3p4r985ft62q64lua7gx7lal",
        poolHex: "ea90b56d9c4d04c583ec728c8b415948b310d4653d12bd281aaff9df",
        ticker: "SALT",
        name: "Salt Pool — Hosky ISPO",
        homepage: "https://saltpool.io",
        hoskyada: 2215,
        liveSaturation: 0.0416,
        marginCost: 0,
        liveDelegators: 454,
    },
    {
        poolId: "pool1df9rj4n0t3zlpak7xnh4ue6t3yh9zlw7a02w4l8askp77up25rt",
        poolHex: "6a4a39566f5c45f0f6de34ef5e674b892e517ddeebd4eafcfd8583ef",
        ticker: "VEGAS",
        name: "VEGASPool",
        iconUrl: "https://cdn.statically.io/gh/sp33dy/VEGAS/main/icon.png",
        homepage: "https://www.ada.vegas",
        hoskyada: 1801,
        liveSaturation: 0.0596,
        marginCost: 0.02,
        liveDelegators: 1046,
    },
    {
        poolId: "pool1dpu6kslgxlg3ccrwxldl8e6r7ylnq0yalafmucp0yc7k6qegtt0",
        poolHex: "6879ab43e837d11c606e37dbf3e743f13f303c9dff53be602f263d6d",
        ticker: "FARM",
        name: "ADA Farm",
        iconUrl: "https://adafarm.io/adafarmsheild64x64.png",
        homepage: "https://adafarm.io",
        hoskyada: 684,
        liveSaturation: 0.110,
        marginCost: 0.0095,
        liveDelegators: 427,
    },
    {
        poolId: "pool1c86ul4pnqvu7jzag8fjdy6dgrn6pt4ad4vmyq038hyg0wl2kaed",
        poolHex: "c1f5cfd4330339e90ba83a64d269a81cf415d7adab36403e27b910f7",
        ticker: "BAIDU",
        name: "baidu",
        homepage: "https://zjavax.github.io/cardano_doc/",
        hoskyada: 537,
        liveSaturation: 0.142,
        marginCost: 0.02,
        liveDelegators: 447,
    },
    {
        poolId: "pool18zf8txwv8lmtpq2src8wrhz0pjut5qft8h5tfxnctwc95r7jvvj",
        poolHex: "38927599cc3ff6b081501e0ee1dc4f0cb8ba012b3de8b49a785bb05a",
        ticker: "MALU",
        name: "Maluiin",
        iconUrl: "https://i.ibb.co/h9KH38V/MP-logo.png",
        homepage: "https://maluiin.com",
        hoskyada: 318,
        liveSaturation: 0.235,
        marginCost: 0.03,
        liveDelegators: 2016,
    },
    {
        poolId: "pool1j099ctc7kcc9fa78dz5qwsy2g0n96lrgletwxvxmyzh4zd7ck0j",
        poolHex: "93ca5c2f1eb63054f7c768a807408a43e65d7c68fe56e330db20af51",
        ticker: "PRIDE",
        name: "Stake with Pride — Hosky ISPO",
        iconUrl: "https://stakewithpride.github.io/64px.png",
        homepage: "https://www.StakeWithPride.com",
        hoskyada: 217,
        liveSaturation: 0.347,
        marginCost: 0.0199,
        liveDelegators: 1968,
    },
];

/**
 * Resolve a curated pool by bech32, hex hash, or ticker (case-insensitive).
 * Returns null if no match.
 */
export function resolveCuratedPool(idOrTickerOrHex: string): CuratedPool | null {
    const v = idOrTickerOrHex.trim().toLowerCase();
    if (!v) return null;
    return (
        CURATED_POOLS.find((p) => p.poolId.toLowerCase() === v) ??
        CURATED_POOLS.find((p) => p.poolHex.toLowerCase() === v) ??
        CURATED_POOLS.find((p) => p.ticker.toLowerCase() === v) ??
        null
    );
}
