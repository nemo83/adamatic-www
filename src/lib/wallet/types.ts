/**
 * CIP-30 wallet typing — the minimum surface AdaMatic actually consumes.
 * No `@cardano-foundation/cardano-connect-with-wallet` dependency.
 */
export interface Cip30Api {
    getNetworkId(): Promise<number>;
    getUtxos(): Promise<string[] | null>;
    getCollateral?(params?: { amount?: string }): Promise<string[] | null>;
    getBalance(): Promise<string>;
    getUsedAddresses(): Promise<string[]>;
    getUnusedAddresses(): Promise<string[]>;
    getChangeAddress(): Promise<string>;
    getRewardAddresses(): Promise<string[]>;
    signTx(tx: string, partialSign: boolean): Promise<string>;
    signData(addr: string, payload: string): Promise<{ signature: string; key: string }>;
    submitTx(tx: string): Promise<string>;
    experimental?: {
        on?: (eventName: "accountChange" | "networkChange", handler: (...args: unknown[]) => void) => void;
        off?: (eventName: "accountChange" | "networkChange", handler: (...args: unknown[]) => void) => void;
        getCollateral?(params?: { amount?: string }): Promise<string[] | null>;
    };
}

export interface Cip30Extension {
    name: string;
    icon: string;
    apiVersion: string;
    enable: (...args: unknown[]) => Promise<Cip30Api>;
    isEnabled?: () => Promise<boolean>;
}

declare global {
    interface Window {
        cardano?: Record<string, Cip30Extension>;
    }
}

export interface WalletInfo {
    /** Key in `window.cardano.*` — e.g. "eternl", "nami", "lace". */
    id: string;
    /** Display name. */
    label: string;
    /** data: URI from `extension.icon`. */
    icon?: string;
    apiVersion?: string;
}

export interface UseWalletResult {
    /** Raw CIP-30 api — pass to the chain adapter; null when disconnected. */
    wallet: Cip30Api | null;
    /** Convenience boolean (true iff `wallet` is non-null). */
    connected: boolean;
    /** Primary used/change address, bech32-decoded. Null when disconnected. */
    address: string | null;
    /** 0 = testnet/preprod/preview, 1 = mainnet. Null when disconnected. */
    networkId: number | null;
    installedWallets: WalletInfo[];
    walletId: string | null;
    connecting: boolean;
    error: string | null;
    connect(walletId: string): Promise<void>;
    disconnect(): void;
}
