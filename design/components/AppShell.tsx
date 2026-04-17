import React from "react";
import { cn } from "../lib/cn";
import { Stamp } from "../ui/Stamp";

type NetworkStatus = "mainnet" | "preprod" | "mismatch" | "disconnected";

export interface AppShellProps {
  children: React.ReactNode;
  network?: NetworkStatus;
  walletSlot?: React.ReactNode;
  currentPath?: string;
}

const nav: Array<{ label: string; href: string; external?: boolean }> = [
  { label: "Home", href: "/design" },
  { label: "Setup", href: "/design/setup" },
  { label: "Schedules", href: "/design/schedules" },
  {
    label: "Source",
    href: "https://github.com/easy1staking-com/cardano-recurring-payment",
    external: true,
  },
];

const networkMeta: Record<
  NetworkStatus,
  { text: string; tone: "jade" | "amber" | "rust" | "mist" }
> = {
  mainnet: { text: "Mainnet", tone: "jade" },
  preprod: { text: "Preprod", tone: "amber" },
  mismatch: { text: "Wrong network", tone: "rust" },
  disconnected: { text: "Offline", tone: "mist" },
};

export const AppShell: React.FC<AppShellProps> = ({
  children,
  network = "disconnected",
  walletSlot,
  currentPath = "/",
}) => {
  const n = networkMeta[network];

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="sticky top-0 z-20 bg-paper/90 border-b border-rule backdrop-blur-[2px]">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3 md:gap-6 px-4 md:px-8 py-3 md:py-4">
          <a href="/design" className="flex items-center gap-3 group">
            <span
              aria-hidden
              className={cn(
                "inline-block w-6 h-6 rounded-full",
                "border-[1.5px] border-ink border-r-transparent",
                "transition-transform duration-500 ease-quill group-hover:rotate-180",
              )}
            />
            <span className="font-display font-semibold text-[22px] md:text-[26px] leading-none tracking-tight">
              AdaMatic
            </span>
            <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.14em] text-marginalia">
              Recurring payments · Cardano
            </span>
          </a>

          <div className="flex items-center gap-2 md:gap-6">
            <nav className="hidden md:flex items-center gap-6">
              {nav.map((item) => {
                const active = item.href === currentPath;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    {...(item.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className={cn(
                      "relative text-sm font-medium transition-opacity",
                      active ? "opacity-100" : "opacity-60 hover:opacity-100",
                    )}
                  >
                    {item.label}
                    {active && (
                      <span
                        aria-hidden
                        className="absolute left-0 right-0 -bottom-1.5 h-[2px] bg-amber"
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            <Stamp tone={n.tone} dot>
              {n.text}
            </Stamp>

            {walletSlot}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-rule mt-10 md:mt-20 py-8 md:py-10 px-4 md:px-8">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia">
              AdaMatic — est. MMXXIV
            </div>
            <div className="text-sm text-marginalia mt-1">
              Sponsored by{" "}
              <a
                href="https://easy1staking.com"
                className="text-ink underline-offset-4 hover:underline"
              >
                Easy1Staking
              </a>
              .
            </div>
          </div>

          <nav className="flex flex-wrap gap-6">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                {...(item.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="text-sm font-medium opacity-60 hover:opacity-100 transition-opacity"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
};
