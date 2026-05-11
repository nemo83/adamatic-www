/**
 * Two-phase polling after a delegation tx is submitted:
 *   1. Wait for the tx to land in a block (Blockfrost). Fast — ~30s typically.
 *   2. Poll the AdaMatic BE's `is_delegated_to_hosky` until it flips true.
 *      Slow — Cardano applies stake delegation at epoch boundaries, so the
 *      BE check may take 1–2 epochs to reflect the change.
 *
 * Updates a single toast in place across both phases, then calls
 * `onDelegated` so the form can re-run its delegation check and unlock.
 *
 * Fire-and-forget: don't `await` it. If the user navigates away, the JS
 * runtime is torn down and polling stops naturally.
 */
import toast from "react-hot-toast";
import {
    BLOCKFROST_API_KEY,
    NETWORK,
} from "../../../lib/cardano/constants";
import { fetchIsDelegatedToHosky } from "../../../lib/api/adamatic";

function blockfrostBaseUrl(): string {
    const net = (NETWORK ?? "mainnet").toLowerCase();
    if (net === "preprod") return "https://cardano-preprod.blockfrost.io/api/v0";
    if (net === "preview") return "https://cardano-preview.blockfrost.io/api/v0";
    return "https://cardano-mainnet.blockfrost.io/api/v0";
}

async function isTxConfirmed(hash: string): Promise<boolean> {
    if (!BLOCKFROST_API_KEY) return false;
    try {
        const res = await fetch(`${blockfrostBaseUrl()}/txs/${hash}`, {
            headers: { project_id: BLOCKFROST_API_KEY },
        });
        return res.ok;
    } catch {
        return false;
    }
}

const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

const TX_TIMEOUT_MS = 5 * 60 * 1000;
const TX_POLL_MS = 8 * 1000;

const DELEGATION_TIMEOUT_MS = 5 * 60 * 1000;
const DELEGATION_POLL_MS = 30 * 1000;

const shortHash = (h: string) =>
    h.length > 18 ? `${h.slice(0, 8)}…${h.slice(-8)}` : h;

/** Translation function — same shape as I18nProvider's `t()`. */
type T = (key: string, vars?: Record<string, string | number>) => string;

export interface TrackDelegationOptions {
    txHash: string;
    /** Bech32 of the delegated wallet — used by the BE check. */
    walletAddress: string;
    /** Toast id to update across phases (so we don't pile up toasts). */
    toastId: string;
    /** Translation function from the calling component. */
    t: T;
    /** Called when `is_delegated_to_hosky` flips true — typically a state
     *  bump that triggers the form to re-check delegation. */
    onDelegated?: () => void;
}

export async function trackDelegationFlow(opts: TrackDelegationOptions) {
    const { txHash, walletAddress, toastId, t, onDelegated } = opts;

    // ── Phase 1 ── tx confirmation ────────────────────────────────────────
    toast.loading(t("delegate.submitted", { hash: shortHash(txHash) }), {
        id: toastId,
    });
    const txStart = Date.now();
    let confirmed = false;
    while (Date.now() - txStart < TX_TIMEOUT_MS) {
        if (await isTxConfirmed(txHash)) {
            confirmed = true;
            break;
        }
        await sleep(TX_POLL_MS);
    }
    if (!confirmed) {
        toast.error(t("delegate.txTimeout"), {
            id: toastId,
            duration: 9000,
        });
        return;
    }
    toast.loading(t("delegate.confirmedChecking"), { id: toastId });

    // ── Phase 2 ── is_delegated_to_hosky ──────────────────────────────────
    const delStart = Date.now();
    let delegated = false;
    while (Date.now() - delStart < DELEGATION_TIMEOUT_MS) {
        if (await fetchIsDelegatedToHosky(walletAddress)) {
            delegated = true;
            break;
        }
        await sleep(DELEGATION_POLL_MS);
    }

    if (!delegated) {
        toast(t("delegate.notYetActive"), {
            id: toastId,
            duration: 12000,
            icon: "⏳",
        });
        return;
    }

    toast.success(t("delegate.activated"), {
        id: toastId,
        duration: 8000,
    });
    onDelegated?.();
}
