/**
 * useWallet — drop-in replacement for @meshsdk/react's hook.
 *
 * Returns `{ wallet, connected }` shaped like Mesh's hook so existing
 * consumers keep working unchanged. Extended with fields that the old
 * hook didn't surface (address, networkId, walletApi, installedWallets,
 * connect/disconnect) for the new wallet UX.
 */
import type { IWallet } from "@meshsdk/core";
import { useWalletContext } from "./WalletProvider";

export function useWallet() {
    const ctx = useWalletContext();
    return {
        /** Mesh-compatible IWallet — used by existing adapters/components. */
        wallet: ctx.wallet as IWallet,
        /** Boolean convenience, mirrors Mesh's hook shape. */
        connected: ctx.wallet !== null,

        // Extended surface, new in the custom provider.
        walletApi: ctx.walletApi,
        walletId: ctx.walletId,
        address: ctx.address,
        networkId: ctx.networkId,
        connecting: ctx.connecting,
        error: ctx.error,
        installedWallets: ctx.installedWallets,
        refreshInstalled: ctx.refreshInstalled,
        connect: ctx.connect,
        disconnect: ctx.disconnect,
    };
}
