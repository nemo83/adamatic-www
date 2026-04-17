import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const button = cva(
  "appearance-none inline-flex items-center justify-center gap-2 font-medium leading-none whitespace-nowrap transition-colors ease-quill focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:cursor-not-allowed disabled:opacity-55 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-paper border border-ink shadow-pressed hover:bg-ink-soft active:translate-y-px disabled:bg-paper-raised disabled:text-marginalia disabled:border-rule disabled:shadow-none",
        outline:
          "bg-transparent text-ink border border-ink hover:bg-paper-raised",
        ghost: "bg-transparent text-ink hover:bg-paper-raised",
        danger:
          "bg-transparent text-rust border border-rust hover:bg-rust hover:text-paper",
        amber:
          "bg-amber text-paper border border-amber shadow-pressed hover:bg-amber-ink active:translate-y-px",
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-sharp",
        md: "h-11 px-5 text-[15px] rounded-sharp",
        lg: "h-[52px] px-6 text-[15px] rounded-sharp",
        icon: "h-9 w-9 rounded-sharp",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(button({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
