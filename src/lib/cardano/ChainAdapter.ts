/**
 * ChainAdapter — the stable surface between the UI and whichever Cardano
 * off-chain SDK is powering the dApp. Phase B ships a single Mesh
 * implementation; Phase C/D swap to Evolution by providing a second
 * implementation of the same interface.
 *
 * Types here are intentionally opaque (`unknown` / branded aliases) so
 * consumers don't transitively pick up Mesh / Evolution types.
 */
import type { RecurringPayment } from "../../types/RecurringPayment";
import type { RecurringPaymentDatum } from "../../types/RecurringPaymentDatum";

/** Adapter-encoded inline-datum value. Mesh: `Data`; Evolution: `Data.Data`. */
export type EncodedDatum = unknown;

/** Adapter-opaque wallet handle — Mesh's `IWallet` or a CIP-30 `walletApi`. */
export type WalletHandle = unknown;

export interface ParsedAddress {
    /** Bech32 (normalised — round-trips through the SDK's parser). */
    bech32: string;
    /** Payment credential hash (hex). */
    paymentCredentialHash: string;
    /** Stake credential hash (hex). Empty for enterprise addresses. */
    stakeCredentialHash?: string;
    /** Top-level kind for quick UI branching. */
    kind: "base" | "enterprise" | "reward";
    /** True only if the SDK accepted the bech32 and we extracted credentials. */
    isValid: boolean;
    /** Human-readable rejection reason. */
    error?: string;
}

export interface DeriveScriptAddressParams {
    /** Bech32 source address — its stake credential becomes the staking part of the script address. */
    walletFrom: string;
    /** Hex script hash. In Phase B this is computed by the Mesh adapter from the
     *  hardcoded SCRIPT; in Phase C onward it's `finalHash` from the BE manifest. */
    scriptHash: string;
    /** 0 = testnet/preprod/preview, 1 = mainnet. Defaults to env. */
    networkId?: number;
}

export interface BuildSetupContext {
    wallet: WalletHandle;
    /** One address per contract UTxO we pay into. */
    walletFromList: string[];
    /** Lovelace deposit per source wallet. */
    depositLovelace: number;
    /** Inline datum (already encoded — produced by `encodeSetupDatum`). */
    datum: EncodedDatum;
    /** Hex script hash for the destination script address. */
    scriptHash: string;
}

export interface BuildCancelContext {
    wallet: WalletHandle;
    payments: RecurringPayment[];
    /** Hex script hash. Reserved for future tripwires; the cancel path uses
     *  the on-chain reference UTxO and doesn't need to re-derive the hash. */
    scriptHash: string;
}

export interface BuildDelegationContext {
    wallet: WalletHandle;
    /** Bech32 pool id (`pool1...`). */
    poolBech32: string;
}

export interface ChainAdapter {
    parseAddress(bech32: string): ParsedAddress;
    deriveScriptAddress(params: DeriveScriptAddressParams): Promise<string>;
    encodeSetupDatum(dto: RecurringPaymentDatum): EncodedDatum;

    /** Build + sign + submit. Returns tx hash. */
    buildAndSubmitSetupTx(ctx: BuildSetupContext): Promise<string>;
    /** Build + sign + submit. Returns tx hash. */
    buildAndSubmitCancelTx(ctx: BuildCancelContext): Promise<string>;
    /**
     * Delegate the connected wallet's stake to a given pool. Auto-registers
     * the stake key (combined cert) when it isn't registered yet. Returns
     * tx hash.
     */
    buildAndSubmitDelegateTx(ctx: BuildDelegationContext): Promise<string>;
}
