import React from "react";
import { cn } from "../lib/cn";
import { Check } from "lucide-react";

export interface Step {
  key: string;
  title: string;
  caption?: string;
}

export interface StepperProps {
  steps: Step[];
  current: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  current,
  onStepClick,
  className,
}) => (
  <nav
    aria-label="Setup progress"
    className={cn("w-full", className)}
  >
    <ol className="flex items-center gap-0">
      {steps.map((step, i) => {
        const state: "done" | "current" | "upcoming" =
          i < current ? "done" : i === current ? "current" : "upcoming";
        const clickable = i < current && onStepClick;
        const isLast = i === steps.length - 1;
        return (
          <li
            key={step.key}
            className={cn("flex items-center", !isLast && "flex-1")}
          >
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick!(i)}
              className={cn(
                "flex items-center gap-3 text-left",
                clickable && "hover:opacity-100",
                !clickable && "cursor-default",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "shrink-0 w-7 h-7 rounded-full border grid place-items-center transition-colors font-mono text-[12px]",
                  state === "done" &&
                    "bg-ink border-ink text-paper",
                  state === "current" &&
                    "border-amber text-amber-ink bg-amber/10",
                  state === "upcoming" &&
                    "border-rule text-marginalia",
                )}
              >
                {state === "done" ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className="hidden md:flex flex-col leading-tight">
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.14em]",
                    state === "current" ? "text-amber-ink" : "text-marginalia",
                  )}
                >
                  Step {i + 1}
                </span>
                <span
                  className={cn(
                    "text-[13px] font-medium",
                    state === "upcoming" && "text-marginalia",
                  )}
                >
                  {step.title}
                </span>
              </span>
            </button>
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "flex-1 h-px mx-3 md:mx-4 min-w-[16px] transition-colors",
                  i < current ? "bg-ink" : "bg-rule",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
