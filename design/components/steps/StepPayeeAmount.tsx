import React from "react";
import { Field, Input } from "../../ui/Field";
import { cn } from "../../lib/cn";
import type { UsePaymentSetupResult } from "../../../lib/features/setup/usePaymentSetup";

const LOVELACE_PER_ADA = 1_000_000;

export const StepPayeeAmount: React.FC<{
    setup: UsePaymentSetupResult;
    mode: "hosky" | "generic";
}> = ({ setup, mode }) => {
    const { state, setPayee, setAmountToSend } = setup;
    const isHosky = mode === "hosky";

    const firstAsset = state.amountToSend[0] ?? {
        policyId: "",
        assetName: "",
        amount: 0,
    };
    const isLovelaceAsset = !firstAsset.policyId;
    const displayAmount = isLovelaceAsset
        ? (firstAsset.amount / LOVELACE_PER_ADA).toString()
        : firstAsset.amount.toString();
    const displayUnit = isLovelaceAsset ? "ADA" : firstAsset.assetName || "TOKEN";

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
                    {isHosky
                        ? "Hosky's Doggie Bowl is the fixed payee for this mode; amount is set by the on-chain protocol."
                        : "Pick the recipient and the amount of each payment. One asset per payment."}
                </p>
            </header>

            <Field
                id="payee"
                label="Payee address"
                helper={
                    isHosky
                        ? "Fixed by the Hosky Doggie Bowl template."
                        : "Any Cardano address. Stake keys are supported."
                }
            >
                <Input
                    id="payee"
                    placeholder="addr1q…"
                    value={state.payee}
                    onChange={(e) => setPayee(e.target.value)}
                    disabled={isHosky}
                />
            </Field>

            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <Field
                    id="amount"
                    label="Amount per payment"
                    helper={
                        isHosky
                            ? "Set by the Hosky template."
                            : "Deducted from each source wallet per interval."
                    }
                    className="flex-[2]"
                    adornment={<span>{displayUnit}</span>}
                >
                    <Input
                        id="amount"
                        value={displayAmount}
                        disabled={isHosky}
                        onChange={(e) => {
                            const n = parseFloat(e.target.value);
                            if (Number.isNaN(n)) return;
                            const next = isLovelaceAsset
                                ? Math.round(n * LOVELACE_PER_ADA)
                                : Math.round(n);
                            setAmountToSend([
                                {
                                    ...firstAsset,
                                    amount: next,
                                },
                            ]);
                        }}
                    />
                </Field>
            </div>
        </div>
    );
};
