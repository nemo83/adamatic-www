import React from "react";
import { cn } from "../lib/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  caption?: React.ReactNode;
}

export interface SegmentedProps<T extends string> {
  value: T;
  onChange: (next: T) => void;
  options: SegmentedOption<T>[];
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = "md",
  className,
  ariaLabel,
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex border border-ink rounded-sharp p-1 bg-paper",
        "w-full md:w-auto",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 md:flex-none px-4 text-left rounded-sharp transition-colors ease-quill",
              size === "md" ? "py-2" : "py-1.5",
              active
                ? "bg-ink text-paper"
                : "text-ink hover:bg-paper-raised",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
            )}
          >
            <div className="font-medium text-sm">{opt.label}</div>
            {opt.caption && (
              <div
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.14em] mt-0.5",
                  active ? "text-paper/70" : "text-marginalia",
                )}
              >
                {opt.caption}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
