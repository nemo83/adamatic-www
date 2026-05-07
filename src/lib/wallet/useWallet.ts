/**
 * Single import point for the wallet hook. Phase B re-exports Mesh's
 * `useWallet`; Phase D replaces this with a custom CIP-30 hook with
 * identical surface (`{ wallet, connected }`).
 */
import { useWallet as useMeshWallet } from "@meshsdk/react";
import type { UseWalletResult } from "./types";

export function useWallet(): UseWalletResult {
    const { wallet, connected } = useMeshWallet();
    return { wallet, connected };
}
