import React from "react";
import { Checkbox } from "../../ui/Checkbox";
import { Stamp } from "../../ui/Stamp";
import { Copy } from "lucide-react";
import type { StepProps } from "./types";

const shortAddr = (a: string) =>
  a && a.length > 22 ? `${a.slice(0, 12)}…${a.slice(-8)}` : a;

const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

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

export const StepReview: React.FC<StepProps> = ({ value, onChange }) => {
  const set = <K extends keyof typeof value>(k: K, v: (typeof value)[K]) =>
    onChange({ ...value, [k]: v });

  const amount = Number(value.amount) || 0;
  const maxFee = Number(value.maxFeeAda) || 0;
  const walletCount = value.wallets.filter((w) => w.status === "valid").length;

  const startMs = value.startTime ? Date.parse(value.startTime + "Z") : NaN;
  const endMs = value.endTime ? Date.parse(value.endTime + "Z") : NaN;

  // Rough count of pulls if both bounds set, else just show "open-ended"
  const pulls =
    Number.isFinite(startMs) && Number.isFinite(endMs)
      ? Math.max(
          1,
          Math.floor(
            (endMs - startMs) /
              (1000 * 60 * 60 * 24 * 5 * value.frequencyEpochs),
          ),
        )
      : 1;

  const totalPayments = amount * pulls * Math.max(walletCount, 1);
  const totalFees = maxFee * pulls * Math.max(walletCount, 1);

  const copy = (text: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(text).catch(() => {});
    }
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
          <Stamp tone="mist">Unsigned</Stamp>
        </div>
        <p className="text-[15px] text-marginalia max-w-xl leading-relaxed">
          Amounts and cadence are enforced by the on-chain validator once you
          sign. You can cancel pending payments at any time.
        </p>
      </header>

      <section className="border border-ink rounded-card bg-paper overflow-hidden">
        <div className="px-5 md:px-6 py-4">
          <Row k="Payee">
            <span className="inline-flex items-center gap-1.5">
              <span className="font-mono text-[13px]">
                {shortAddr(value.payee) || "—"}
              </span>
              {value.payee && (
                <button
                  type="button"
                  onClick={() => copy(value.payee)}
                  aria-label="Copy payee address"
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
                {fmt(amount, value.asset === "ADA" ? 2 : 4)}
              </span>
              <span className="font-mono text-[11px] tracking-[0.1em] text-marginalia">
                {value.asset}
              </span>
            </span>
          </Row>
          <Row k="Cadence">
            <span className="text-sm">
              Every{" "}
              <span className="num font-medium">{value.frequencyEpochs}</span>{" "}
              epoch{value.frequencyEpochs === 1 ? "" : "s"}
              {value.endTime ? (
                <>
                  {" "}
                  · <span className="num">{pulls}</span> pulls planned
                </>
              ) : (
                " · open-ended"
              )}
            </span>
          </Row>
          <Row k="Fee ceiling">
            <span className="num text-sm">
              {fmt(maxFee)}{" "}
              <span className="font-mono text-[11px] text-marginalia">ADA / pull</span>
            </span>
          </Row>
        </div>

        <div className="bg-paper-raised border-t border-ink px-5 md:px-6 py-5 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia">
              Total to deposit (all wallets)
            </div>
            <div className="mt-1 font-display text-[32px] md:text-[40px] font-semibold leading-none num">
              {fmt(totalPayments, value.asset === "ADA" ? 2 : 4)}
              <span className="ml-2 font-mono text-[14px] text-marginalia">
                {value.asset}
              </span>
            </div>
            {totalFees > 0 && (
              <div className="mt-1.5 font-mono text-[12px] text-marginalia">
                up to {fmt(totalFees)} ADA in fees
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3">
        <Checkbox
          checked={value.acceptRisk}
          onCheckedChange={(v) => set("acceptRisk", v)}
          label={
            <>
              I understand that on-chain activity is irreversible and that the
              schedule runs until I cancel it.
            </>
          }
        />
        <Checkbox
          checked={value.acceptFees}
          onCheckedChange={(v) => set("acceptFees", v)}
          label={
            <>
              I authorise up to{" "}
              <span className="num font-medium">{value.maxFeeAda || "—"} ADA</span>{" "}
              in fees per pull.
            </>
          }
        />
      </div>
    </div>
  );
};
