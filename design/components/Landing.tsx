import React from "react";
import { Segmented } from "../ui/Segmented";
import { Button } from "../ui/Button";
import { ArrowRight } from "lucide-react";
import { PoweredByCharli3 } from "./PoweredByCharli3";

export type PaymentMode = "hosky" | "generic";

export interface LandingProps {
  mode: PaymentMode;
  onModeChange: (m: PaymentMode) => void;
  onStart?: () => void;
}

const stats = [
  { k: "Active schedules", v: "312" },
  { k: "Paid since launch", v: "18,440 ₳" },
  { k: "Median fee", v: "0.42 ₳" },
];

export const Landing: React.FC<LandingProps> = ({
  mode,
  onModeChange,
  onStart,
}) => (
  <section className="relative overflow-hidden">
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none opacity-50"
      style={{
        backgroundImage:
          "linear-gradient(var(--rule) 1px, transparent 1px), linear-gradient(90deg, var(--rule) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage:
          "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 80%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 80%)",
      }}
    />

    <div className="relative z-[1] max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-20">
      <div className="max-w-3xl flex flex-col gap-4 md:gap-5 animate-stagger-in">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia">
          Automated payments · № 01
        </div>
        <h1 className="font-display text-[clamp(40px,6.5vw,72px)] font-semibold leading-[0.98] tracking-[-0.02em]">
          Pay on a{" "}
          <em
            className="italic text-amber-ink"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
          >
            schedule
          </em>
          ,
          <br />
          settle on-chain.
        </h1>
        <p className="max-w-xl text-[17px] md:text-[19px] text-ink/75 leading-relaxed">
          Sign once; your payments run every epoch, week, or cadence you choose.
          Cardano-native, non-custodial, cancellable any time.
        </p>
      </div>

      <div className="mt-6 md:mt-10 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <Segmented
          ariaLabel="Payment mode"
          value={mode}
          onChange={onModeChange}
          options={[
            {
              value: "hosky",
              label: "Hosky Doggie Bowl",
              caption: "Fixed · 2 ₳ every 5 days",
            },
            {
              value: "generic",
              label: "Generic schedule",
              caption: "Any asset · any cadence",
            },
          ]}
        />
        <Button onClick={onStart} size="lg" className="md:ml-2">
          Begin setup
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="mt-10 md:mt-14 pt-6 md:pt-8 border-t border-rule grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
        {stats.map((s) => (
          <div key={s.k}>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia">
              {s.k}
            </div>
            <div className="mt-1 font-display text-[28px] md:text-[36px] font-semibold leading-none num">
              {s.v}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 md:mt-10">
        <PoweredByCharli3 variant="banner" />
      </div>
    </div>
  </section>
);
