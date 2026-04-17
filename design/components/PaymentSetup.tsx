import React, { useState } from "react";
import { ArrowLeft, ArrowRight, PenLine } from "lucide-react";
import { Button } from "../ui/Button";
import { Stepper } from "./Stepper";
import { StepPayeeAmount } from "./steps/StepPayeeAmount";
import { StepWallets } from "./steps/StepWallets";
import { StepCadence } from "./steps/StepCadence";
import { StepReview } from "./steps/StepReview";
import type { PaymentFormValue } from "./steps/types";

export interface PaymentSetupProps {
  mode: "hosky" | "generic";
  value: PaymentFormValue;
  onChange: (v: PaymentFormValue) => void;
  onSubmit?: () => void;
  submitting?: boolean;
}

const stepsDef = [
  { key: "payee", title: "Payee & amount" },
  { key: "wallets", title: "Source wallets" },
  { key: "cadence", title: "Cadence" },
  { key: "review", title: "Review & sign" },
];

export const PaymentSetup: React.FC<PaymentSetupProps> = ({
  mode,
  value,
  onChange,
  onSubmit,
  submitting,
}) => {
  const [step, setStep] = useState(0);

  const canAdvance = () => {
    if (step === 0)
      return value.payee.trim().length > 0 && Number(value.amount) > 0;
    if (step === 1)
      return (
        value.wallets.length > 0 &&
        value.wallets.some((w) => w.status === "valid")
      );
    if (step === 2)
      return value.startTime.trim().length > 0 && value.frequencyEpochs > 0;
    return value.acceptRisk && value.acceptFees;
  };

  const isLast = step === stepsDef.length - 1;

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
          {step === 0 && (
            <StepPayeeAmount mode={mode} value={value} onChange={onChange} />
          )}
          {step === 1 && (
            <StepWallets mode={mode} value={value} onChange={onChange} />
          )}
          {step === 2 && (
            <StepCadence mode={mode} value={value} onChange={onChange} />
          )}
          {step === 3 && (
            <StepReview mode={mode} value={value} onChange={onChange} />
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 pt-4 border-t border-rule">
          <Button
            variant="ghost"
            size="md"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          {isLast ? (
            <Button
              variant="primary"
              size="lg"
              disabled={!canAdvance() || submitting}
              onClick={onSubmit}
            >
              <PenLine className="w-4 h-4" />
              {submitting ? "Submitting…" : "Sign & submit"}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              disabled={!canAdvance()}
              onClick={() => setStep((s) => Math.min(stepsDef.length - 1, s + 1))}
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
