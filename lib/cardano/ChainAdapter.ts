/**
 * ChainAdapter — the stable surface between the UI and whichever Cardano
 * off-chain SDK is powering the dApp. Phase 3 ships a single Mesh
 * implementation; Phase 4 adds an Evolution implementation and flips the
 * factory. Callers must not import MeshSDK directly — go through this.
 */
import type { Data, IWallet, PlutusScript } from "@meshsdk/core";
import type RecurringPayment from "../interfaces/RecurringPayment";
import type RecurringPaymentDatum from "../interfaces/RecurringPaymentDatum";

/**
 * Opaque datum handle — produced by the adapter, consumed by the adapter.
 * Today it aliases Mesh's `Data` type so Phase 3 wiring still typechecks;
 * Phase 4 can widen this to `unknown` and each adapter keeps its own internal shape.
 */
export type EncodedDatum = Data;

/** A Cardano address parsed into its credentials. */
export interface ParsedAddress {
    /** Original bech32 (normalised — e.g. basePayment+stakeKey survives round-trip). */
    bech32: string;
    /** Payment credential hash (hex). */
    paymentCredentialHash: string;
    /** Stake credential hash (hex), if any (base or reward addresses). */
    stakeCredentialHash?: string;
    /** High-level category, for quick UI branching. */
    kind: "base" | "enterprise" | "reward";
    /** Whether the address is recognised and usable. */
    isValid: boolean;
    /** Human-readable failure reason when `isValid` is false. */
    error?: string;
}

export interface BuildSetupContext {
    /** Mesh-wrapped wallet — used by MeshChainAdapter, ignored by Evolution. */
    wallet: IWallet;
    /** Raw CIP-30 api — used by EvolutionChainAdapter, ignored by Mesh. */
    walletApi?: unknown;
    /** One address per contract UTxO we pay into. */
    walletFromList: string[];
    /** Lovelace deposit per wallet. */
    depositLovelace: number;
    /** Inline datum (already encoded — produced by `encodeSetupDatum`). */
    datum: EncodedDatum;
    /** Hex script hash of the automatic_payments validator, from the BE. */
    scriptHash: string;
}

export interface BuildCancelContext {
    wallet: IWallet;
    walletApi?: unknown;
    payments: RecurringPayment[];
    /** Hex script hash of the automatic_payments validator. */
    scriptHash: string;
}

export interface DeriveScriptAddressParams {
    /** Bech32 address whose stake credential is embedded in the output. */
    walletFrom: string;
    /** Final (post-parameter-application) script hash, from the BE manifest. */
    scriptHash: string;
    /** 0 = testnet/preprod/preview, 1 = mainnet. Defaults to the env value. */
    networkId?: number;
}

export interface ChainAdapter {
    /** Parse a bech32 address into credentials. Never throws. */
    parseAddress(bech32: string): ParsedAddress;

    /**
     * Derive the script address keyed to a specific stake credential, so
     * every source wallet pays into its own contract UTxO. The script hash
     * comes from the BE `/scripts` manifest — no client-side hashing.
     */
    deriveScriptAddress(params: DeriveScriptAddressParams): Promise<string>;

    /** Encode the recurring-payment datum for inclusion as an inline datum. */
    encodeSetupDatum(dto: RecurringPaymentDatum): EncodedDatum;

    /** Build + sign + submit the setup transaction. Returns tx hash. */
    buildAndSubmitSetupTx(ctx: BuildSetupContext): Promise<string>;

    /**
     * Build the cancel transaction (unsigned CBOR). Signing + submission
     * is done by the caller so it can batch UI feedback around the wallet
     * prompt.
     */
    buildCancelTx(ctx: BuildCancelContext): Promise<string>;
}
