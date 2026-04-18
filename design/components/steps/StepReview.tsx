import React from "react";
import { Checkbox } from "../../ui/Checkbox";
import { Stamp } from "../../ui/Stamp";
import { Copy } from "lucide-react";
import type { UsePaymentSetupResult } from "../../../lib/features/setup/usePaymentSetup";

const LOVELACE_PER_ADA = 1_000_000;

const shortAddr = (a: string) =>
    a && a.length > 22 ? `${a.slice(0, 12)}…${a.slice(-8)}` : a;

const fmt = (n: number, d = 2) =>
    n.toLocaleString("en-US", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
    });

const Row: React.FC<{ k: string; children: React.ReactNode }> = ({
    k,
    children,
}) => (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-rule last:border-b-0">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia">
            {k}
        </span>
        <span className="text-right">{children}</span>
    </div>
);

export const StepReview: React.FC<{
    setup: UsePaymentSetupResult;
    mode: "hosky" | "generic";
}> = ({ setup }) => {
    const { state, derived, setAcceptRisk, setAcceptFees, txHash } = setup;

    const asset = state.amountToSend[0];
    const assetUnit = asset?.policyId ? asset.assetName : "ADA";
    const isLovelace = !asset?.policyId;

    const amount = asset?.amount ?? 0;
    const amountPretty = isLovelace
        ? fmt(amount / LOVELACE_PER_ADA, 2)
        : fmt(amount, 0);
    const walletCount = Math.max(
        1,
        state.walletRows.filter((r) => r.status === "valid").length,
    );

    // The deposit is what actually gets locked at the script address per
    // source wallet. For Hosky mode it comes from the BE template; for
    // generic it's computed FE-side as numPulls * (amount + maxFee).
    const totalDepositLovelace = state.deposit * walletCount;
    const totalDepositPretty = fmt(totalDepositLovelace / LOVELACE_PER_ADA, 2);

    const totalFees = state.maxFeesLovelace * state.numPulls * walletCount;
    const totalPayments = amount * state.numPulls * walletCount;
    const totalPaymentsPretty = isLovelace
        ? fmt(totalPayments / LOVELACE_PER_ADA, 2)
        : fmt(totalPayments, 0);

    const copy = (text: string) => {
        if (typeof navigator !== "undefined")
            navigator.clipboard?.writeText(text).catch(() => void 0);
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-up">
            <header className="flex flex-col gap-2">
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia">
                    Step 4 of 4
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="font-display text-[34px] md:text-[42px] font-semibold leading-[1.05] tracking-tight">
                        Review and sign.
                    </h2>
                    {txHash ? (
                        <Stamp tone="jade">Submitted</Stamp>
                    ) : (
                        <Stamp tone="mist">Unsigned</Stamp>
                    )}
                </div>
                <p className="text-[15px] text-marginalia max-w-xl leading-relaxed">
                    Amounts and cadence are enforced by the on-chain validator
                    once you sign. You can cancel pending payments any time.
                </p>
            </header>

            <section className="border border-ink rounded-card bg-paper overflow-hidden">
                <div className="px-5 md:px-6 py-4">
                    <Row k="Payee">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="font-mono text-[13px]">
                                {shortAddr(state.payee) || "—"}
                            </span>
                            {state.payee && (
                                <button
                                    type="button"
                                    onClick={() => copy(state.payee)}
                                    aria-label="Copy payee"
                                    className="p-1 rounded-sharp text-marginalia hover:bg-paper-raised hover:text-ink"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </span>
                    </Row>
                    <Row k="Source wallets">
                        <span className="num text-sm">{walletCount}</span>
                    </Row>
                    <Row k="Per payment">
                        <span className="inline-flex items-baseline gap-1">
                            <span className="font-display text-[22px] font-semibold num">
                                {amountPretty}
                            </span>
                            <span className="font-mono text-[11px] tracking-[0.1em] text-marginalia">
                                {assetUnit}
                            </span>
                        </span>
                    </Row>
                    <Row k="Cadence">
                        <span className="text-sm">
                            Every{" "}
                            <span className="num font-medium">
                                {state.paymentIntervalEpochs}
                            </span>{" "}
                            epoch{state.paymentIntervalEpochs === 1 ? "" : "s"}
                            {state.numPulls > 0 ? (
                                <>
                                    {" "}
                                    ·{" "}
                                    <span className="num">{state.numPulls}</span>{" "}
                                    pulls
                                </>
                            ) : (
                                " · open-ended"
                            )}
                        </span>
                    </Row>
                    <Row k="Fee ceiling">
                        <span className="num text-sm">
                            {fmt(state.maxFeesLovelace / LOVELACE_PER_ADA)}{" "}
                            <span className="font-mono text-[11px] text-marginalia">
                                ADA / pull
                            </span>
                        </span>
                    </Row>
                </div>

                <div className="bg-paper-raised border-t border-ink px-5 md:px-6 py-5 flex items-center justify-between gap-6 flex-wrap">
                    <div>
                        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia">
                            Total to deposit
                        </div>
                        <div className="mt-1 font-display text-[32px] md:text-[40px] font-semibold leading-none num">
                            {totalDepositPretty}
                            <span className="ml-2 font-mono text-[14px] text-marginalia">
                                ADA
                            </span>
                        </div>
                        <div className="mt-1.5 font-mono text-[12px] text-marginalia">
                            {totalPaymentsPretty} {assetUnit} for payments
                            {" + "}
                            up to {fmt(totalFees / LOVELACE_PER_ADA)} ADA in fees
                        </div>
                    </div>
                </div>
            </section>

            {txHash ? (
                <div className="rounded-card border border-jade bg-jade/5 px-5 py-4">
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-jade mb-1">
                        Transaction submitted
                    </div>
                    <div className="font-mono text-[13px] break-all">
                        {txHash}
                    </div>
                    <a
                        href={`https://cardanoscan.io/transaction/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-[13px] text-amber-ink hover:underline"
                    >
                        View on cardanoscan →
                    </a>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <Checkbox
                        checked={state.acceptRisk}
                        onCheckedChange={setAcceptRisk}
                        label={
                            <>
                                I understand that on-chain activity is
                                irreversible and the schedule runs until I
                                cancel.
                            </>
                        }
                    />
                    <Checkbox
                        checked={state.acceptFees}
                        onCheckedChange={setAcceptFees}
                        label={
                            <>
                                I authorise up to{" "}
                                <span className="num font-medium">
                                    {fmt(
                                        state.maxFeesLovelace / LOVELACE_PER_ADA,
                                    )}{" "}
                                    ADA
                                </span>{" "}
                                in fees per pull.
                            </>
                        }
                    />
                    {derived.blockReason && (
                        <div className="mt-2 text-[13px] text-rust">
                            {derived.blockReason}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
