import React from "react";
import { Field, Input } from "../../ui/Field";
import { cn } from "../../lib/cn";
import { Plus, Minus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { UsePaymentSetupResult } from "../../../lib/features/setup/usePaymentSetup";

export const StepWallets: React.FC<{
    setup: UsePaymentSetupResult;
    mode: "hosky" | "generic";
}> = ({ setup, mode }) => {
    const { state, addWallet, removeWallet, updateWallet } = setup;

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
                    {mode === "hosky"
                        ? "Each address is validated for format and checked for delegation to a Hosky pool."
                        : "Each source wallet pays independently on the same cadence."}
                </p>
            </header>

            <div className="flex flex-col gap-4">
                {state.walletFromList.map((address, i) => {
                    const row = state.walletRows[i];
                    const hasError =
                        row && (row.status === "invalid" || row.status === "not-delegated");
                    const adornment =
                        !row || row.status === "empty"
                            ? null
                            : row.status === "validating"
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : row.status === "valid"
                                ? <CheckCircle2 className="w-4 h-4 text-jade" />
                                : <AlertCircle className="w-4 h-4 text-rust" />;
                    return (
                        <div key={i} className="flex items-end gap-2">
                            <Field
                                id={`wallet-${i}`}
                                label={`Address ${i + 1}`}
                                error={hasError && address ? row.message : null}
                                adornment={adornment}
                                className="flex-1"
                            >
                                <Input
                                    id={`wallet-${i}`}
                                    placeholder="addr1q… / stake1u…"
                                    value={address}
                                    onChange={(e) => updateWallet(i, e.target.value)}
                                />
                            </Field>
                            <button
                                type="button"
                                onClick={() => removeWallet(i)}
                                disabled={state.walletFromList.length === 1}
                                aria-label={`Remove address ${i + 1}`}
                                className={cn(
                                    "shrink-0 w-10 h-10 mb-1 rounded-sharp border border-rule hover:border-rust hover:bg-rust/5 hover:text-rust transition-colors grid place-items-center",
                                    "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-rule disabled:hover:bg-transparent disabled:hover:text-ink",
                                )}
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}

                <button
                    type="button"
                    onClick={addWallet}
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
