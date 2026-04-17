import React from "react";
import { Field, Input } from "../../ui/Field";
import type { StepProps } from "./types";

export const StepCadence: React.FC<StepProps> = ({ value, onChange }) => {
  const set = <K extends keyof typeof value>(k: K, v: (typeof value)[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <header className="flex flex-col gap-2">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia">
          Step 3 of 4
        </div>
        <h2 className="font-display text-[34px] md:text-[42px] font-semibold leading-[1.05] tracking-tight">
          When does it run?
        </h2>
        <p className="text-[15px] text-marginalia max-w-xl leading-relaxed">
          Pick a start, optional end, and how often the schedule fires. Times
          are in UTC; Cardano epochs are 5 days each.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Field
          id="start"
          label="Start (UTC)"
          helper="The first payment will fire at or shortly after this time."
        >
          <Input
            id="start"
            placeholder="YYYY-MM-DD HH:MM"
            value={value.startTime}
            onChange={(e) => set("startTime", e.target.value)}
          />
        </Field>
        <Field
          id="end"
          label="End (optional)"
          helper="Leave empty to run until balance is exhausted."
        >
          <Input
            id="end"
            placeholder="YYYY-MM-DD HH:MM"
            value={value.endTime ?? ""}
            onChange={(e) => set("endTime", e.target.value || null)}
          />
        </Field>
      </div>

      <Field
        id="frequency"
        label="Frequency"
        helper="A value of 1 means every epoch (every 5 days on mainnet)."
        adornment={<span>epoch{value.frequencyEpochs === 1 ? "" : "s"}</span>}
        className="max-w-sm"
      >
        <Input
          id="frequency"
          type="number"
          min={1}
          value={value.frequencyEpochs}
          onChange={(e) =>
            set("frequencyEpochs", Math.max(1, Number(e.target.value) || 1))
          }
        />
      </Field>

      <Field
        id="maxfee"
        label="Max fee per pull"
        helper="The ceiling you authorise for protocol + network fees. The operator may charge less; never more."
        adornment={<span>ADA</span>}
        className="max-w-sm"
      >
        <Input
          id="maxfee"
          inputMode="decimal"
          value={value.maxFeeAda}
          onChange={(e) => set("maxFeeAda", e.target.value)}
        />
      </Field>
    </div>
  );
};
