import React from "react";
import { Field, Input } from "../../ui/Field";
import { cn } from "../../lib/cn";
import type { AssetUnit, StepProps } from "./types";

const assets: AssetUnit[] = ["ADA", "USDM", "DJED", "SNEK", "HOSKY"];

export const StepPayeeAmount: React.FC<StepProps> = ({ mode, value, onChange }) => {
  const set = <K extends keyof typeof value>(k: K, v: (typeof value)[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <header className="flex flex-col gap-2">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia">
          Step 1 of 4
        </div>
        <h2 className="font-display text-[34px] md:text-[42px] font-semibold leading-[1.05] tracking-tight">
          Where does the money go?
        </h2>
        <p className="text-[15px] text-marginalia max-w-xl leading-relaxed">
          Pick the recipient and the amount of each payment. You can change the
          asset below — one asset per payment.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <Field
          id="payee"
          label="Payee address"
          helper={
            mode === "hosky"
              ? "Fixed by the Hosky Doggie Bowl template."
              : "Any Cardano address. Stake keys are supported for multi-wallet setups."
          }
        >
          <Input
            id="payee"
            placeholder="addr1q…"
            value={value.payee}
            onChange={(e) => set("payee", e.target.value)}
            disabled={mode === "hosky"}
          />
        </Field>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <Field
            id="amount"
            label="Amount per payment"
            helper="Deducted from each source wallet at every interval."
            className="flex-[2]"
            adornment={<span>{value.asset}</span>}
          >
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="0.00"
              value={value.amount}
              onChange={(e) => set("amount", e.target.value)}
            />
          </Field>
          <div className="flex-1">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia mb-1.5">
              Asset
            </div>
            <div className="flex flex-wrap gap-1.5">
              {assets.map((a) => {
                const active = value.asset === a;
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => set("asset", a)}
                    className={cn(
                      "px-3 py-1.5 border rounded-sharp font-mono text-[12px] tracking-[0.08em] transition-colors",
                      active
                        ? "border-ink bg-ink text-paper"
                        : "border-rule hover:border-ink hover:bg-paper-raised",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
                    )}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
