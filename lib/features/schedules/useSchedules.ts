/**
 * useSchedules — fetch + cancel for recurring payments, consumed by
 * pages/schedules.tsx. Post-Mesh-removal: raw CIP-30 walletApi only.
 */
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useWallet } from "../../wallet/useWallet";
import { getChainAdapter } from "../../cardano/factory";
import { useScriptByName } from "../../cardano/ScriptContext";
import { ADAMATIC_HOST } from "../../util/Constants";
import type RecurringPayment from "../../interfaces/RecurringPayment";

export function useSchedules() {
    const { walletApi, address, connected } = useWallet();
    const automaticPayments = useScriptByName("automatic_payments");
    const [payments, setPayments] = useState<RecurringPayment[]>([]);
    const [loading, setLoading] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [version, setVersion] = useState(0);

    const reload = useCallback(() => setVersion((v) => v + 1), []);

    useEffect(() => {
        if (!connected || !address) {
            setPayments([]);
            return;
        }
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const chain = getChainAdapter();
                const parsed = chain.parseAddress(address);
                if (!parsed.isValid) return;
                const resp = await fetch(
                    ADAMATIC_HOST +
                        "/recurring_payments/public_key_hash/" +
                        parsed.paymentCredentialHash,
                );
                if (!resp.ok) {
                    if (!cancelled) setPayments([]);
                    return;
                }
                const raw = (await resp.json()) as any[];
                if (cancelled) return;
                setPayments(
                    raw.map((rp) => ({
                        txHash: rp.tx_hash,
                        output_index: rp.output_index,
                        staking_address: rp.staking_address,
                        balance: rp.balance,
                        amountToSend: [],
                        payee: rp.payee,
                        startTime: dayjs(rp.start_time_timestamp),
                        endTime: undefined,
                        paymentIntervalHours: 0,
                        maxPaymentDelayHours: 0,
                        paymentStatus: rp.payment_status,
                    })),
                );
            } catch (err) {
                console.warn("Schedules fetch failed:", err);
                if (!cancelled) setPayments([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [connected, address, version]);

    const cancelMany = useCallback(
        async (toCancel: RecurringPayment[]) => {
            if (!walletApi || toCancel.length === 0) return;
            if (!automaticPayments?.finalHash) {
                toast.error(
                    "Script manifest not loaded yet — retry in a second",
                );
                return;
            }
            setCancelling(true);
            try {
                const chain = getChainAdapter();
                const hash = await chain.buildCancelTx({
                    walletApi,
                    payments: toCancel,
                    scriptHash: automaticPayments.finalHash,
                    scriptRawCode: automaticPayments.rawCompiledCode,
                    scriptParameters: automaticPayments.parameters,
                    scriptVersion: automaticPayments.plutusVersion,
                });
                toast.success(
                    `Cancelled ${toCancel.length} schedule${toCancel.length === 1 ? "" : "s"}: ${hash.slice(0, 10)}…`,
                    { duration: 5000 },
                );
                reload();
            } catch (err: any) {
                toast.error(err?.message ?? String(err), { duration: 5000 });
            } finally {
                setCancelling(false);
            }
        },
        [walletApi, automaticPayments, reload],
    );

    return {
        payments,
        loading,
        cancelling,
        reload,
        cancelOne: (p: RecurringPayment) => cancelMany([p]),
        cancelMany,
    };
}
