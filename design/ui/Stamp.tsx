import React from "react";
import { cn } from "../lib/cn";

type Tone = "neutral" | "amber" | "jade" | "rust" | "mist";

export interface StampProps {
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}

const toneCls: Record<Tone, string> = {
  neutral: "border-ink text-ink",
  amber: "border-amber text-amber-ink bg-amber/5",
  jade: "border-jade text-jade bg-jade/5",
  rust: "border-rust text-rust bg-rust/5",
  mist: "border-rule text-marginalia",
};

export const Stamp: React.FC<StampProps> = ({
  children,
  tone = "neutral",
  dot,
  className,
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 border font-mono text-[11px] tracking-[0.14em] uppercase rounded-sharp leading-none",
      toneCls[tone],
      className,
    )}
  >
    {dot && (
      <span
        aria-hidden
        className="inline-block w-1.5 h-1.5 rounded-full bg-current"
      />
    )}
    {children}
  </span>
);
