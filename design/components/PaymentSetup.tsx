import React, { useState } from "react";
import { ArrowLeft, ArrowRight, PenLine } from "lucide-react";
import { Button } from "../ui/Button";
import { Stepper } from "./Stepper";
import { StepPayeeAmount } from "./steps/StepPayeeAmount";
import { StepWallets } from "./steps/StepWallets";
import { StepCadence } from "./steps/StepCadence";
import { StepReview } from "./steps/StepReview";
import { usePaymentSetup } from "../../lib/features/setup/usePaymentSetup";

const stepsDef = [
    { key: "payee", title: "Payee & amount" },
    { key: "wallets", title: "Source wallets" },
    { key: "cadence", title: "Cadence" },
    { key: "review", title: "Review & sign" },
];

export const PaymentSetup: React.FC<{ mode: "hosky" | "generic" }> = ({
    mode,
}) => {
    const setup = usePaymentSetup({ mode });
    const [step, setStep] = useState(0);
    const isLast = step === stepsDef.length - 1;

    // Per-step gate. Blocking on the last step routes through the derived
    // `isSubmittable` which aggregates everything.
    const canAdvance = () => {
        if (step === 0) {
            const firstAmount = setup.state.amountToSend[0];
            return (
                setup.state.payee.trim().length > 0 &&
                (firstAmount?.amount ?? 0) > 0
            );
        }
        if (step === 1) {
            return setup.state.walletRows.some((r) => r.status === "valid");
        }
        if (step === 2) {
            return (
                setup.state.startTime !== null &&
                setup.state.paymentIntervalEpochs > 0 &&
                setup.state.maxFeesLovelace > 0
            );
        }
        return setup.derived.isSubmittable;
    };

    return (
        <section className="px-4 md:px-8 py-10 md:py-16">
            <div className="max-w-[860px] mx-auto flex flex-col gap-8 md:gap-10">
                <div className="flex flex-col gap-1">
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia">
                        Setup · {mode === "hosky" ? "Hosky Doggie Bowl" : "Generic schedule"}
                    </div>
                    <Stepper
                        steps={stepsDef}
                        current={step}
                        onStepClick={(i) => setStep(i)}
                    />
                </div>

                <div className="min-h-[400px]">
                    {step === 0 && <StepPayeeAmount setup={setup} mode={mode} />}
                    {step === 1 && <StepWallets setup={setup} mode={mode} />}
                    {step === 2 && <StepCadence setup={setup} mode={mode} />}
                    {step === 3 && <StepReview setup={setup} mode={mode} />}
                </div>

                <footer className="flex items-center justify-between gap-3 pt-4 border-t border-rule">
                    <Button
                        variant="ghost"
                        size="md"
                        disabled={step === 0 || setup.submitting}
                        onClick={() => setStep((s) => Math.max(0, s - 1))}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    {isLast ? (
                        <Button
                            variant="primary"
                            size="lg"
                            disabled={!canAdvance() || setup.submitting || setup.txHash !== null}
                            onClick={() => setup.submit()}
                        >
                            <PenLine className="w-4 h-4" />
                            {setup.txHash
                                ? "Submitted"
                                : setup.submitting
                                  ? "Submitting…"
                                  : "Sign & submit"}
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="md"
                            disabled={!canAdvance()}
                            onClick={() =>
                                setStep((s) =>
                                    Math.min(stepsDef.length - 1, s + 1),
                                )
                            }
                        >
                            Next
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    )}
                </footer>
            </div>
        </section>
    );
};
