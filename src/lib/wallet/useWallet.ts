/**
 * Wallet hook — re-exports the WalletProvider context.
 */
import { useWalletContext } from "./WalletProvider";
import type { UseWalletResult } from "./types";

export function useWallet(): UseWalletResult {
    return useWalletContext();
}
