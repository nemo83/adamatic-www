import React from "react";
import { Field, Input } from "../../ui/Field";
import type { UsePaymentSetupResult } from "../../../lib/features/setup/usePaymentSetup";

const LOVELACE_PER_ADA = 1_000_000;

export const StepCadence: React.FC<{
    setup: UsePaymentSetupResult;
    mode: "hosky" | "generic";
}> = ({ setup, mode }) => {
    const {
        state,
        setMaxFeesLovelace,
        setNumPulls,
        setPaymentIntervalEpochs,
        setStartTime,
        setEndTime,
    } = setup;
    const isHosky = mode === "hosky";

    const maxFeeAda = (state.maxFeesLovelace / LOVELACE_PER_ADA).toString();

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
                    {isHosky
                        ? "Pick max fee and how many pulls — the BE computes start/end epochs for you."
                        : "Pick a start, optional end, and how often the schedule fires. Times are in UTC."}
                </p>
            </header>

            {isHosky ? (
                <>
                    <Field
                        id="maxfee"
                        label="Max fee per pull"
                        helper="Ceiling for protocol + network fees per pull. The operator can charge less; never more."
                        adornment={<span>ADA</span>}
                        className="max-w-sm"
                    >
                        <Input
                            id="maxfee"
                            inputMode="decimal"
                            value={maxFeeAda}
                            onChange={(e) => {
                                const n = parseFloat(e.target.value);
                                if (Number.isNaN(n)) return;
                                setMaxFeesLovelace(Math.round(n * LOVELACE_PER_ADA));
                            }}
                        />
                    </Field>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Field
                            id="numpulls"
                            label="Number of pulls"
                            helper="The schedule fires this many times total."
                            adornment={<span>pulls</span>}
                        >
                            <Input
                                id="numpulls"
                                type="number"
                                min={1}
                                max={50}
                                value={state.numPulls}
                                onChange={(e) =>
                                    setNumPulls(Number(e.target.value) || 1)
                                }
                            />
                        </Field>
                        <Field
                            id="frequency"
                            label="Every N epochs"
                            helper="1 epoch = 5 days on mainnet."
                            adornment={<span>epoch{state.paymentIntervalEpochs === 1 ? "" : "s"}</span>}
                        >
                            <Input
                                id="frequency"
                                type="number"
                                min={1}
                                value={state.paymentIntervalEpochs}
                                onChange={(e) =>
                                    setPaymentIntervalEpochs(
                                        Number(e.target.value) || 1,
                                    )
                                }
                            />
                        </Field>
                    </div>

                    <div className="rounded-card border border-rule p-4 bg-paper-raised/60">
                        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia mb-1">
                            Computed by BE template
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                            <Cell k="Epoch start" v={state.epochStart} />
                            <Cell k="Epoch end" v={state.epochEnd} />
                            <Cell
                                k="First pull"
                                v={
                                    state.startTime
                                        ? state.startTime.format(
                                              "YYYY-MM-DD HH:mm",
                                          )
                                        : "—"
                                }
                            />
                            <Cell
                                k="Last pull"
                                v={
                                    state.endTime
                                        ? state.endTime.format(
                                              "YYYY-MM-DD HH:mm",
                                          )
                                        : "—"
                                }
                            />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-2">
                        <Field
                            id="start"
                            label="Start (UTC)"
                            helper="The first payment fires at or shortly after this time."
                        >
                            <Input
                                id="start"
                                placeholder="YYYY-MM-DD HH:MM"
                                value={
                                    state.startTime
                                        ? state.startTime.format(
                                              "YYYY-MM-DD HH:mm",
                                          )
                                        : ""
                                }
                                onChange={(e) => {
                                    const dayjs = require("dayjs");
                                    const d = dayjs(e.target.value);
                                    setStartTime(d.isValid() ? d : null);
                                }}
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
                                value={
                                    state.endTime
                                        ? state.endTime.format(
                                              "YYYY-MM-DD HH:mm",
                                          )
                                        : ""
                                }
                                onChange={(e) => {
                                    if (!e.target.value) {
                                        setEndTime(null);
                                        return;
                                    }
                                    const dayjs = require("dayjs");
                                    const d = dayjs(e.target.value);
                                    setEndTime(d.isValid() ? d : null);
                                }}
                            />
                        </Field>
                    </div>
                    <Field
                        id="frequency"
                        label="Every N epochs"
                        helper="1 epoch = 5 days on mainnet."
                        adornment={<span>epoch{state.paymentIntervalEpochs === 1 ? "" : "s"}</span>}
                        className="max-w-sm"
                    >
                        <Input
                            id="frequency"
                            type="number"
                            min={1}
                            value={state.paymentIntervalEpochs}
                            onChange={(e) =>
                                setPaymentIntervalEpochs(
                                    Number(e.target.value) || 1,
                                )
                            }
                        />
                    </Field>
                    <Field
                        id="maxfee"
                        label="Max fee per pull"
                        adornment={<span>ADA</span>}
                        className="max-w-sm"
                    >
                        <Input
                            id="maxfee"
                            inputMode="decimal"
                            value={maxFeeAda}
                            onChange={(e) => {
                                const n = parseFloat(e.target.value);
                                if (Number.isNaN(n)) return;
                                setMaxFeesLovelace(Math.round(n * LOVELACE_PER_ADA));
                            }}
                        />
                    </Field>
                </>
            )}
        </div>
    );
};

const Cell: React.FC<{ k: string; v: React.ReactNode }> = ({ k, v }) => (
    <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-marginalia">
            {k}
        </div>
        <div className="num text-[15px] mt-0.5">{v}</div>
    </div>
);
