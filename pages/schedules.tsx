import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Plus, RefreshCcw } from "lucide-react";
import { LedgerLayout } from "../design/layout";
import {
    PaymentsTable,
    type PaymentRow,
} from "../design/components/PaymentsTable";
import { Button } from "../design/ui/Button";
import { useSchedules } from "../lib/features/schedules/useSchedules";

function SchedulesPage() {
    const router = useRouter();
    const { payments, loading, cancelling, reload, cancelOne, cancelMany } =
        useSchedules();
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const rows: PaymentRow[] = useMemo(
        () =>
            payments.map((p) => ({
                id: p.txHash + "-" + p.output_index,
                stakingAddress: p.staking_address,
                nextRun:
                    p.paymentStatus === "SCHEDULED"
                        ? p.startTime.format("YYYY-MM-DD HH:mm") + " UTC"
                        : undefined,
                balanceLovelace: p.balance?.[0]?.amount ?? 0,
                asset: "ADA",
                status: p.paymentStatus as PaymentRow["status"],
            })),
        [payments],
    );

    const cancellable = payments.filter(
        (p) =>
            p.paymentStatus === "SCHEDULED" ||
            p.paymentStatus === "INSUFFICIENT_FUNDS",
    );

    const toggle = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    };

    const toggleAll = () => {
        const cancellableRows = rows.filter(
            (r) =>
                r.status === "SCHEDULED" || r.status === "INSUFFICIENT_FUNDS",
        );
        if (cancellableRows.every((r) => selected.has(r.id))) {
            setSelected(new Set());
        } else {
            setSelected(new Set(cancellableRows.map((r) => r.id)));
        }
    };

    const onCancelRow = (id: string) => {
        const match = payments.find((p) => p.txHash + "-" + p.output_index === id);
        if (match) cancelOne(match);
    };

    const onCancelSelected = () => {
        const toCancel = payments.filter((p) =>
            selected.has(p.txHash + "-" + p.output_index),
        );
        cancelMany(toCancel).then(() => setSelected(new Set()));
    };

    return (
        <LedgerLayout currentPath="/schedules">
            <section className="px-4 md:px-8 pt-10 md:pt-14">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-3">
                    <div>
                        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia">
                            Ledger · № 03
                        </div>
                        <h1 className="font-display text-[32px] md:text-[44px] font-semibold leading-[1.05] mt-1">
                            My schedules
                        </h1>
                        <p className="text-marginalia text-sm mt-1.5 max-w-xl">
                            Every recurring payment signed by the connected wallet.
                            {loading && " · loading…"}
                            {cancelling && " · cancelling…"}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={reload} variant="outline" size="md">
                            <RefreshCcw className="w-4 h-4" />
                            Refresh
                        </Button>
                        <Button
                            onClick={() => router.push("/setup")}
                            size="md"
                        >
                            <Plus className="w-4 h-4" />
                            New schedule
                        </Button>
                    </div>
                </div>
            </section>

            <PaymentsTable
                rows={rows}
                selected={selected}
                onSelect={toggle}
                onSelectAll={toggleAll}
                onView={() => void 0}
                onCancel={onCancelRow}
                onCancelSelected={onCancelSelected}
            />
        </LedgerLayout>
    );
}

(SchedulesPage as any).standalone = true;
export default SchedulesPage;
