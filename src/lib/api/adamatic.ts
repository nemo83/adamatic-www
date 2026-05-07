/**
 * Centralised AdaMatic backend client. Every BE call lives here, each wrapped
 * in try/catch so a dead BE degrades gracefully (no Next dev overlay on
 * "Failed to fetch"). Returns `null` on failure — callers branch on that.
 */
import { ADAMATIC_HOST } from "../cardano/constants";
import type { ScriptsPayload } from "../cardano/ScriptContext";
import type {
    HoskyTemplate,
    PaymentDetails,
    Settings,
} from "../../types/AdaMaticTypes";
import type { RecurringPayment } from "../../types/RecurringPayment";

async function safeJson<T>(url: string): Promise<T | null> {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.warn(`GET ${url} → HTTP ${res.status}`);
            return null;
        }
        return (await res.json()) as T;
    } catch (err) {
        console.warn(`GET ${url} failed:`, err);
        return null;
    }
}

export function fetchScripts(): Promise<ScriptsPayload | null> {
    return safeJson<ScriptsPayload>(`${ADAMATIC_HOST}/scripts`);
}

export function fetchSettings(): Promise<Settings | null> {
    return safeJson<Settings>(`${ADAMATIC_HOST}/settings`);
}

export function fetchHoskyTemplate(
    params?: Record<string, string>,
): Promise<HoskyTemplate | null> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return safeJson<HoskyTemplate>(
        `${ADAMATIC_HOST}/recurring_payments/template/hosky${qs}`,
    );
}

export function fetchIsDelegatedToHosky(address: string): Promise<boolean> {
    return safeJson<boolean>(
        `${ADAMATIC_HOST}/hosky/${address}/is_delegated_to_hosky`,
    ).then((v) => v ?? false);
}

export function fetchRecurringPaymentsByPkh(
    paymentPubKeyHash: string,
): Promise<RecurringPayment[]> {
    return safeJson<RecurringPayment[]>(
        `${ADAMATIC_HOST}/recurring_payments/public_key_hash/${paymentPubKeyHash}`,
    ).then((v) => v ?? []);
}

export function fetchPaymentDetails(
    txHash: string,
    outputIndex: number,
): Promise<PaymentDetails | null> {
    const qs = new URLSearchParams({
        tx_hash: txHash,
        output_index: outputIndex.toString(),
    }).toString();
    return safeJson<PaymentDetails>(
        `${ADAMATIC_HOST}/recurring_payments/details?${qs}`,
    );
}
