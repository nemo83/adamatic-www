/**
 * Wallet provider shim. Phase B re-exports Mesh's `MeshProvider`;
 * Phase D replaces this with a custom CIP-30 provider that handles
 * persisted reconnect + focus/visibilitychange refresh.
 */
import { MeshProvider } from "@meshsdk/react";
import type { ReactNode } from "react";

export function WalletProvider({ children }: { children: ReactNode }) {
    return <MeshProvider>{children}</MeshProvider>;
}
