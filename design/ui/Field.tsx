import React from "react";
import { cn } from "../lib/cn";

/**
 * Field — label + input + helper + error. Inputs inside use plain
 * <input> / <select> / <textarea> with the styles defined here so
 * we don't fight a component library.
 */

export interface FieldProps {
  id?: string;
  label?: React.ReactNode;
  helper?: React.ReactNode;
  error?: React.ReactNode;
  adornment?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({
  id,
  label,
  helper,
  error,
  adornment,
  className,
  children,
}) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    {label && (
      <label
        htmlFor={id}
        className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia"
      >
        {label}
      </label>
    )}
    <div
      className={cn(
        "group flex items-center gap-2 border-b-[1.5px] transition-colors ease-quill",
        error ? "border-rust" : "border-ink/80 focus-within:border-ink",
      )}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {adornment && (
        <div className="flex items-center text-marginalia font-mono text-xs uppercase tracking-[0.12em] pb-2">
          {adornment}
        </div>
      )}
    </div>
    {error ? (
      <p className="text-xs text-rust">{error}</p>
    ) : helper ? (
      <p className="text-xs text-marginalia leading-relaxed">{helper}</p>
    ) : null}
  </div>
);

export const inputCls =
  "w-full bg-transparent font-mono text-[16px] text-ink placeholder:text-marginalia outline-none pt-4 pb-2 disabled:opacity-60 disabled:cursor-not-allowed";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(inputCls, className)} {...props} />
  ),
);
Input.displayName = "Input";
