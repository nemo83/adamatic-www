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
import type { Cip30Api } from "./types";

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

/**
 * ADA balance of the connected wallet, decoded from CIP-30 `getBalance()`.
 *
 * The CIP-30 spec returns a CBOR-encoded `value`:
 *   - ADA only → a single CBOR uint
 *   - ADA + native assets → CBOR array `[coin: uint, multi_asset: map]`
 *
 * We only need the lovelace component, so a tiny custom decoder is
 * sufficient — pulling in a full CBOR lib for one field would be overkill.
 */
export async function getWalletAdaBalance(walletApi: Cip30Api): Promise<bigint> {
    const hex = await walletApi.getBalance();
    return decodeLovelaceFromBalanceCbor(hex);
}

function decodeLovelaceFromBalanceCbor(hex: string): bigint {
    const buf = hexToBytes(hex);
    if (buf.length === 0) return 0n;
    // 0x82 = CBOR array of length 2 → [coin, multi_asset]; coin starts at offset 1.
    if (buf[0] === 0x82) {
        return decodeCborUint(buf, 1).value;
    }
    return decodeCborUint(buf, 0).value;
}

function decodeCborUint(buf: Uint8Array, pos: number): { value: bigint; next: number } {
    const b = buf[pos];
    if (b < 0x18) return { value: BigInt(b), next: pos + 1 };
    if (b === 0x18) return { value: BigInt(buf[pos + 1]), next: pos + 2 };
    if (b === 0x19) {
        return {
            value: (BigInt(buf[pos + 1]) << 8n) | BigInt(buf[pos + 2]),
            next: pos + 3,
        };
    }
    if (b === 0x1A) {
        let v = 0n;
        for (let i = 0; i < 4; i++) v = (v << 8n) | BigInt(buf[pos + 1 + i]);
        return { value: v, next: pos + 5 };
    }
    if (b === 0x1B) {
        let v = 0n;
        for (let i = 0; i < 8; i++) v = (v << 8n) | BigInt(buf[pos + 1 + i]);
        return { value: v, next: pos + 9 };
    }
    throw new Error(`unsupported CBOR uint marker 0x${b.toString(16).padStart(2, "0")}`);
}

function hexToBytes(hex: string): Uint8Array {
    const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
    const len = clean.length / 2;
    const out = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        out[i] = parseInt(clean.substr(i * 2, 2), 16);
    }
    return out;
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
