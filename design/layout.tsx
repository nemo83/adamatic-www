/**
 * Shared layout wrapper for every /design/* page.
 * Adds the ledger-root class and the AppShell (navbar + footer).
 */
import React from "react";
import { AppShell } from "./components/AppShell";
import { WalletPicker } from "./components/WalletPicker";

export interface LedgerLayoutProps {
  children: React.ReactNode;
  currentPath: string;
}

const sampleConnection = {
  id: "eternl" as const,
  address:
    "addr1q9x2kd28nq8ac5prwg32hhvudlwggpgfp8utlyqxu6wqgz62f79qsdmm5dsknt9ecr5w468r9ey0fxwkdrwh08ly3tu9sy0f4qd",
};

export const LedgerLayout: React.FC<LedgerLayoutProps> = ({
  children,
  currentPath,
}) => (
  <div className="ledger-root">
    <AppShell
      network="preprod"
      currentPath={currentPath}
      walletSlot={<WalletPicker connected={sampleConnection} />}
    >
      {children}
    </AppShell>
  </div>
);
