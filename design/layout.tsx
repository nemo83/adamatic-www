/**
 * Shared layout for every /design/* page.
 *
 * Wires the design-shell AppShell + WalletPicker to the real `useWallet()`
 * hook so the preview reflects actual wallet state — connect, persisted
 * reconnect, sign out, account-change detection all work the same as on /.
 */
import React from "react";
import { AppShell } from "./components/AppShell";
import { WalletPicker } from "./components/WalletPicker";
import type { WalletInfo as DesignWalletInfo } from "./components/WalletPicker";
import { useWallet } from "../lib/wallet/useWallet";

export interface LedgerLayoutProps {
  children: React.ReactNode;
  currentPath: string;
}

export const LedgerLayout: React.FC<LedgerLayoutProps> = ({
  children,
  currentPath,
}) => {
  const {
    wallet,
    walletId,
    address,
    networkId,
    installedWallets,
    connect,
    disconnect,
  } = useWallet();

  const wallets: DesignWalletInfo[] = installedWallets.map((w) => ({
    id: w.id,
    label: w.label,
    available: true,
    initials: (w.label.slice(0, 2) || w.id.slice(0, 2)).toUpperCase(),
    icon: w.icon,
  }));

  const connectedIcon = walletId
    ? installedWallets.find((w) => w.id === walletId)?.icon
    : undefined;

  const connected =
    wallet && walletId
      ? { id: walletId, address: address ?? "", icon: connectedIcon }
      : null;

  const network: "mainnet" | "preprod" | "mismatch" | "disconnected" = !wallet
    ? "disconnected"
    : networkId === 1
      ? "mainnet"
      : networkId === 0
        ? "preprod"
        : "mismatch";

  return (
    <div className="ledger-root">
      <AppShell
        network={network}
        currentPath={currentPath}
        walletSlot={
          <WalletPicker
            wallets={wallets}
            connected={connected}
            onConnect={(id) => connect(id)}
            onDisconnect={disconnect}
          />
        }
      >
        {children}
      </AppShell>
    </div>
  );
};
