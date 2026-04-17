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
          "flex items-center justify-center shrink-0 w-[18px] h-[18px] mt-0.5",
          "border border-ink rounded-sharp",
          "data-[state=checked]:bg-ink",
          "transition-colors ease-quill",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
        )}
      >
        <C.Indicator className="text-paper">
          <Check className="w-3 h-3" strokeWidth={3} />
        </C.Indicator>
      </C.Root>
      {label && <span className="text-sm leading-relaxed">{label}</span>}
    </label>
  );
};
