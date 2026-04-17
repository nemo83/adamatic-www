import React from "react";
import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../lib/cn";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeCls = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
};

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
  className,
}) => (
  <D.Root open={open} onOpenChange={onOpenChange}>
    <D.Portal>
      <D.Overlay className="ledger-dialog-overlay" />
      <D.Content
        className={cn(
          "ledger-root fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100vw-2rem)]",
          sizeCls[size],
          "bg-paper border border-rule rounded-card shadow-dialog",
          "max-h-[calc(100vh-2rem)] overflow-y-auto",
          "animate-fade-up",
          className,
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-rule">
            <div>
              {title && (
                <D.Title className="font-display text-2xl font-semibold leading-tight">
                  {title}
                </D.Title>
              )}
              {description && (
                <D.Description className="text-sm text-marginalia mt-1">
                  {description}
                </D.Description>
              )}
            </div>
            <D.Close asChild>
              <button
                aria-label="Close"
                className="text-marginalia hover:text-ink p-1 rounded-sharp hover:bg-paper-raised transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </D.Close>
          </div>
        )}
        {children}
      </D.Content>
    </D.Portal>
  </D.Root>
);
