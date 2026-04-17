/**
 * CIP-30 wallet typing — minimal surface we consume.
 *
 * We don't import @cardano-foundation/cardano-connect-with-wallet to stay lean;
 * this is the method subset we actually call.
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
    /** Display name from extension.name, fallback to id. */
    label: string;
    /** data: URI from extension.icon when present. */
    icon?: string;
    apiVersion?: string;
}
