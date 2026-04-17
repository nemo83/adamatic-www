import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { cn } from "../lib/cn";

export type WalletId = "nami" | "eternl" | "lace" | "flint" | "typhon";

export interface WalletInfo {
  id: WalletId;
  label: string;
  available: boolean;
  initials: string;
}

export interface WalletPickerProps {
  wallets?: WalletInfo[];
  connected?: { id: WalletId; address: string } | null;
  onConnect?: (id: WalletId) => void;
  onDisconnect?: () => void;
}

const defaultWallets: WalletInfo[] = [
  { id: "eternl", label: "Eternl", available: true, initials: "ET" },
  { id: "nami", label: "Nami", available: true, initials: "NA" },
  { id: "lace", label: "Lace", available: true, initials: "LA" },
  { id: "typhon", label: "Typhon", available: false, initials: "TY" },
  { id: "flint", label: "Flint", available: false, initials: "FL" },
];

const short = (addr: string) =>
  addr.length > 18 ? `${addr.slice(0, 10)}…${addr.slice(-6)}` : addr;

export const WalletPicker: React.FC<WalletPickerProps> = ({
  wallets = defaultWallets,
  connected = null,
  onConnect,
  onDisconnect,
}) => {
  const [open, setOpen] = useState(false);

  if (connected) {
    return (
      <div className="inline-flex items-center gap-2 border border-ink rounded-sharp px-3 py-1.5 bg-paper">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-marginalia">
          {connected.id}
        </span>
        <span aria-hidden className="w-px h-4 bg-rule" />
        <span className="font-mono text-[13px] text-ink">
          {short(connected.address)}
        </span>
        <button
          type="button"
          onClick={onDisconnect}
          className="ml-1 text-[12px] text-marginalia hover:text-ink"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        Connect wallet
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Sign in"
        description="CIP-30 · Cardano"
        size="sm"
      >
        <div className="px-5 py-2">
          <ul className="divide-y divide-rule">
            {wallets.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  disabled={!w.available}
                  onClick={() => {
                    onConnect?.(w.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 py-3 text-left transition-colors rounded-sharp",
                    "hover:bg-paper-raised",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-[-2px]",
                    !w.available && "opacity-50 cursor-not-allowed hover:bg-transparent",
                  )}
                >
                  <span
                    aria-hidden
                    className="shrink-0 w-9 h-9 border border-ink rounded-sharp grid place-items-center font-mono text-[12px] tracking-[0.1em] font-medium"
                  >
                    {w.initials}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{w.label}</div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-marginalia mt-0.5">
                      {w.available ? "Ready to connect" : "Not installed"}
                    </div>
                  </div>
                  <span aria-hidden className="font-mono text-marginalia text-lg">
                    →
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 mb-4 text-[12px] text-marginalia leading-relaxed">
            AdaMatic never sees your seed phrase. Signing happens inside your
            wallet; every transaction requires your explicit approval.
          </p>
        </div>
      </Dialog>
    </>
  );
};
