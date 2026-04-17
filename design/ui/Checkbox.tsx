import React from "react";
import * as C from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "../lib/cn";

export interface CheckboxProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label?: React.ReactNode;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onCheckedChange,
  label,
  className,
}) => {
  const inputId = id ?? React.useId();
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex items-start gap-3 cursor-pointer select-none group",
        className,
      )}
    >
      <C.Root
        id={inputId}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className={cn(
          "flex items-center justify-center shrink-0 w-5 h-5 mt-0.5",
          "border-2 border-ink rounded-sharp bg-paper",
          "data-[state=checked]:bg-ink",
          "hover:border-ink hover:bg-paper-raised",
          "data-[state=checked]:hover:bg-ink-soft",
          "transition-colors ease-quill",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
        )}
      >
        <C.Indicator className="text-paper">
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        </C.Indicator>
      </C.Root>
      {label && <span className="text-sm leading-relaxed">{label}</span>}
    </label>
  );
};
