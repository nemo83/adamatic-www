/**
 * useSchedules — fetch + cancel for recurring payments, consumed by
 * pages/schedules.tsx. Wraps the BE list endpoint with a per-wallet filter
 * via the payment pubkey hash, and cancels through the chain adapter.
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
    const { wallet, walletApi, connected } = useWallet();
    const automaticPayments = useScriptByName("automatic_payments");
    const [payments, setPayments] = useState<RecurringPayment[]>([]);
    const [loading, setLoading] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [version, setVersion] = useState(0);

    const reload = useCallback(() => setVersion((v) => v + 1), []);

    useEffect(() => {
        if (!connected || !wallet) {
            setPayments([]);
            return;
        }
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const chain = getChainAdapter();
                const addrs = await wallet.getUsedAddresses();
                if (!addrs[0]) return;
                const parsed = chain.parseAddress(addrs[0]);
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
    }, [connected, wallet, version]);

    const cancelMany = useCallback(
        async (toCancel: RecurringPayment[]) => {
            if (!wallet || toCancel.length === 0) return;
            if (!automaticPayments?.finalHash) {
                toast.error(
                    "Script manifest not loaded yet — retry in a second",
                );
                return;
            }
            setCancelling(true);
            try {
                const chain = getChainAdapter();
                const unsigned = await chain.buildCancelTx({
                    wallet,
                    walletApi: walletApi ?? undefined,
                    payments: toCancel,
                    scriptHash: automaticPayments.finalHash,
                });
                const signed = await wallet.signTx(unsigned);
                const hash = await wallet.submitTx(signed);
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
        [wallet, walletApi, automaticPayments, reload],
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
