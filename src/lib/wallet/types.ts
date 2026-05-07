/**
 * Wallet types — Phase B types `wallet` as `any` so consumers don't import
 * `@meshsdk/core` for the IWallet type, but can still call its methods
 * (`getUsedAddresses`, `getNetworkId`, `getCollateral`, `signTx`, …).
 * Phase D replaces this with a typed CIP-30 + adapter wrapper.
 */
// Loose `any` is intentional during Phase B; Phase D narrows to a typed CIP-30 + adapter wrapper.
export type WalletApi = any;

export interface UseWalletResult {
    wallet: WalletApi;
    connected: boolean;
}
