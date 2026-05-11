/**
 * Plain configuration values. No SDK types here — the Plutus script
 * import lives inside MeshChainAdapter (Phase B) and gets dropped in
 * Phase C when ScriptContext takes over from the BE manifest.
 */

export const HOSKY_TOUR_DISPLAYED = "adamatic-hosky-tour-displayed";

export const SETTINGS_TX_HASH =
    "017e5d80c47e4057a48f8579a95d90063d57a7d45127f04c77141b832908ef01";
export const SETTINGS_OUTPUT_INDEX = 0;

// The settings UTxO is dual-purpose: it carries the operator-fee datum
// and hosts the `automatic_payments` validator as a reference script.
// Cancel txs reference it via this outRef instead of inlining the script,
// which would add ~5–10 kB per cancel tx.
export const SCRIPT_REFERENCE_TX_HASH = SETTINGS_TX_HASH;
export const SCRIPT_REFERENCE_OUTPUT_INDEX = SETTINGS_OUTPUT_INDEX;

// Compile-time maintenance gate. When true, the setup page renders an
// alert and the Submit button is disabled. Flip to true, commit, and
// Vercel rebuilds — no runtime trigger needed.
export const MAINTENANCE_MODE: boolean = false;

export const ADA_CONVERSION = 1_000_000;

export const NETWORK_ID = process.env.NEXT_PUBLIC_CARDANO_NETWORK_ID;
export const NETWORK = process.env.NEXT_PUBLIC_CARDANO_NETWORK;
export const ADAMATIC_HOST = process.env.NEXT_PUBLIC_ADAMATIC_API_URL;
export const BLOCKFROST_API_KEY = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;

/** Back-compat namespace — kept until the last consumers are refactored in Phase E. */
export const CONSTANTS = {
    ADA_CONVERSION,
};
