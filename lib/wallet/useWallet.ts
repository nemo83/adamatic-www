/**
 * useWallet — the only wallet hook the rest of the app should use.
 * Exposes the raw CIP-30 api + decoded bech32 address + connect/disconnect.
 */
import { useWalletContext } from "./WalletProvider";

export function useWallet() {
    const ctx = useWalletContext();
    return {
        walletApi: ctx.walletApi,
        walletId: ctx.walletId,
        address: ctx.address,
        networkId: ctx.networkId,
        connecting: ctx.connecting,
        connected: ctx.walletApi !== null,
        error: ctx.error,
        installedWallets: ctx.installedWallets,
        refreshInstalled: ctx.refreshInstalled,
        connect: ctx.connect,
        disconnect: ctx.disconnect,
    };
}
