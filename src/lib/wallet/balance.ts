/**
 * Fetch the total ADA "controlled" by a stake address — sums lovelace
 * across every payment address that shares this stake credential.
 *
 * Source: Blockfrost `GET /accounts/{stake_addr}` returns
 * `controlled_amount` (string lovelace). Returns 0 for never-registered
 * stake keys (404).
 */
import {
    BLOCKFROST_API_KEY,
    NETWORK,
} from "../cardano/constants";

function blockfrostBaseUrl(): string {
    const net = (NETWORK ?? "mainnet").toLowerCase();
    if (net === "preprod") return "https://cardano-preprod.blockfrost.io/api/v0";
    if (net === "preview") return "https://cardano-preview.blockfrost.io/api/v0";
    return "https://cardano-mainnet.blockfrost.io/api/v0";
}

interface AccountInfo {
    controlled_amount?: string;
    active?: boolean;
    pool_id?: string | null;
}

export interface AccountBalance {
    /** Total lovelace controlled by all addresses sharing this stake credential. */
    lovelace: bigint;
    /** Already registered + currently delegating. */
    delegating: boolean;
    /** Pool the stake is delegated to, if any. */
    poolBech32: string | null;
}

export async function fetchControlledBalance(
    rewardBech32: string,
): Promise<AccountBalance | null> {
    if (!BLOCKFROST_API_KEY) return null;
    try {
        const res = await fetch(`${blockfrostBaseUrl()}/accounts/${rewardBech32}`, {
            headers: { project_id: BLOCKFROST_API_KEY },
        });
        if (res.status === 404) {
            // Stake key never registered → effectively 0 ADA controlled
            // (their funds may exist on enterprise addresses, but we can't
            // see those without enumerating the wallet).
            return { lovelace: 0n, delegating: false, poolBech32: null };
        }
        if (!res.ok) return null;
        const json = (await res.json()) as AccountInfo;
        return {
            lovelace: BigInt(json.controlled_amount ?? "0"),
            delegating: Boolean(json.pool_id),
            poolBech32: json.pool_id ?? null,
        };
    } catch {
        return null;
    }
}
