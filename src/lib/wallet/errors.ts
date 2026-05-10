/**
 * Helpers for turning the deeply nested errors that Evolution / Effect-TS /
 * CIP-30 wallets surface into a readable toast.
 *
 * Evolution wraps the wallet error twice: FiberFailure → TransactionBuilderError
 * → WalletError → underlying APIError from the wallet extension. The user-facing
 * `error.message` is the full nested stack — useless in a toast. We walk the
 * `.cause` chain to (a) detect "user rejected the prompt" cases and translate
 * them, and (b) extract the innermost message for everything else.
 */

const REJECTION_PATTERNS: RegExp[] = [
    /declined/i,
    /refused/i,
    /user\s+rejected/i,
    /user\s+denied/i,
    /user\s+cancell?ed/i,
];

function chain(err: unknown): unknown[] {
    const seen = new Set<unknown>();
    const out: unknown[] = [];
    let cur: unknown = err;
    while (cur && !seen.has(cur)) {
        seen.add(cur);
        out.push(cur);
        cur = (cur as { cause?: unknown })?.cause;
    }
    return out;
}

export function isUserDeclinedError(err: unknown): boolean {
    for (const frame of chain(err)) {
        const msg = frame instanceof Error ? frame.message : String(frame ?? "");
        if (REJECTION_PATTERNS.some((re) => re.test(msg))) return true;
    }
    return false;
}

/** Innermost message in the cause chain — skips the FiberFailure wrappers. */
function rootMessage(err: unknown): string {
    const frames = chain(err);
    const root = frames[frames.length - 1];
    if (root instanceof Error) return root.message;
    return String(root ?? err);
}

type Translate = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Returns a toast-ready string for any error thrown from a tx-signing flow.
 * `userCancelledKey` defaults to `tx.userCancelled` and can be overridden for
 * flow-specific copy (e.g. delegation cancellation).
 */
export function formatWalletError(
    err: unknown,
    t: Translate,
    userCancelledKey = "tx.userCancelled",
): string {
    if (isUserDeclinedError(err)) return t(userCancelledKey);
    const msg = rootMessage(err);
    return msg.length > 240 ? msg.slice(0, 240) + "…" : msg;
}
