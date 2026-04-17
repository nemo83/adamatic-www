import React from "react";
import { Field, Input } from "../../ui/Field";
import { cn } from "../../lib/cn";
import { Plus, Minus, CheckCircle2, AlertCircle } from "lucide-react";
import type { StepProps, WalletRow } from "./types";

const statusAdornment = (row: WalletRow) => {
  if (row.status === "valid")
    return (
      <span title="Valid · Delegated" className="inline-flex text-jade">
        <CheckCircle2 className="w-4 h-4" />
      </span>
    );
  if (row.status === "invalid" || row.status === "not-delegated")
    return (
      <span title={row.message ?? "Invalid"} className="inline-flex text-rust">
        <AlertCircle className="w-4 h-4" />
      </span>
    );
  if (row.status === "validating")
    return (
      <span className="font-mono text-[10px] uppercase text-marginalia">…</span>
    );
  return null;
};

export const StepWallets: React.FC<StepProps> = ({ value, onChange }) => {
  const updateWallet = (i: number, next: Partial<WalletRow>) =>
    onChange({
      ...value,
      wallets: value.wallets.map((w, idx) =>
        idx === i ? { ...w, ...next } : w,
      ),
    });

  const add = () =>
    onChange({
      ...value,
      wallets: [...value.wallets, { address: "", status: "empty" }],
    });

  const remove = (i: number) =>
    onChange({
      ...value,
      wallets: value.wallets.filter((_, idx) => idx !== i),
    });

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <header className="flex flex-col gap-2">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia">
          Step 2 of 4
        </div>
        <h2 className="font-display text-[34px] md:text-[42px] font-semibold leading-[1.05] tracking-tight">
          Which wallets fund the schedule?
        </h2>
        <p className="text-[15px] text-marginalia max-w-xl leading-relaxed">
          Each source wallet is validated for format and delegation. Add as many
          as you like — each pays independently on the same cadence.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {value.wallets.map((w, i) => (
          <div key={i} className="flex items-end gap-2">
            <Field
              id={`wallet-${i}`}
              label={`Address ${i + 1}`}
              error={
                (w.status === "invalid" || w.status === "not-delegated") &&
                w.address
                  ? w.message
                  : null
              }
              adornment={statusAdornment(w)}
              className="flex-1"
            >
              <Input
                id={`wallet-${i}`}
                placeholder="addr1q… / stake1u…"
                value={w.address}
                onChange={(e) =>
                  updateWallet(i, {
                    address: e.target.value,
                    status: e.target.value ? "validating" : "empty",
                  })
                }
              />
            </Field>
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={value.wallets.length === 1}
              aria-label={`Remove address ${i + 1}`}
              className={cn(
                "shrink-0 w-10 h-10 mb-1 rounded-sharp border border-rule hover:border-rust hover:bg-rust/5 hover:text-rust transition-colors grid place-items-center",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-rule disabled:hover:bg-transparent disabled:hover:text-ink",
              )}
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={add}
          className={cn(
            "mt-1 flex items-center gap-2 border border-dashed border-rule rounded-sharp px-3 py-3 text-marginalia",
            "transition-colors hover:border-ink hover:text-ink hover:bg-paper-raised",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
          )}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add another address</span>
        </button>
      </div>
    </div>
  );
};
