import React from "react";
import { cn } from "../lib/cn";

export interface PoweredByCharli3Props {
  variant?: "inline" | "banner";
  className?: string;
}

/**
 * "Onchain pricing powered by Charli3" — teaser for the upcoming oracle
 * integration. Logo at /public/img/charli3.png.
 */
export const PoweredByCharli3: React.FC<PoweredByCharli3Props> = ({
  variant = "inline",
  className,
}) => {
  const Content = (
    <>
      <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.14em] text-marginalia">
        Onchain pricing powered by
      </span>
      <img
        src="/img/charli3.png"
        alt=""
        width={22}
        height={22}
        className="inline-block shrink-0"
      />
      <span
        className="font-display italic font-semibold text-[16px] md:text-[18px] text-ink tracking-tight"
        style={{ fontVariationSettings: '"opsz" 48, "SOFT" 70' }}
      >
        Charli3
      </span>
    </>
  );

  if (variant === "banner") {
    return (
      <a
        href="https://charli3.io"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-2.5 border border-rule rounded-card px-4 py-2.5",
          "bg-paper transition-colors hover:border-ink hover:bg-paper-raised",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
          className,
        )}
      >
        {Content}
      </a>
    );
  }

  return (
    <a
      href="https://charli3.io"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 text-marginalia hover:text-ink transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber focus-visible:rounded-sharp",
        className,
      )}
    >
      {Content}
    </a>
  );
};
