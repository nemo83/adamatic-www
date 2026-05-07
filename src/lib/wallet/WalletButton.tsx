/**
 * Wallet connect button shim. Phase B re-exports Mesh's `<CardanoWallet />`;
 * Phase D replaces with a custom MUI-styled picker that enumerates
 * `window.cardano.*` directly.
 */
import { CardanoWallet } from "@meshsdk/react";
import "@meshsdk/react/styles.css";

export function WalletButton() {
    return <CardanoWallet />;
}
