export const HOSKY_TOUR_DISPLAYED = "adamatic-hosky-tour-displayed";

/**
 * The reference-script UTxO that the Mesh cancel path reads from when
 * spending from the script. Temporary — next iteration pulls this from
 * the BE `/scripts` response (one field per script entry) so upgrades
 * don't require a FE release.
 */
export const SETTINGS_TX_HASH =
    "017e5d80c47e4057a48f8579a95d90063d57a7d45127f04c77141b832908ef01";
export const SETTINGS_OUTPUT_INDEX = 0;

export const CONSTANTS = {
    ADA_CONVERSION: 1_000_000,
};

export const NETWORK_ID = process.env.NEXT_PUBLIC_CARDANO_NETWORK_ID;
export const NETWORK = process.env.NEXT_PUBLIC_CARDANO_NETWORK;

export const ADAMATIC_HOST = process.env.NEXT_PUBLIC_ADAMATIC_API_URL;

export const BLOCKFROST_API_KEY = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;
