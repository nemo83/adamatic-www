/**
 * ChainAdapter — the stable surface between the UI and the Cardano SDK.
 * Only one implementation after the MeshSDK removal: EvolutionChainAdapter.
 */
import type { Data } from "@evolution-sdk/evolution";
import type RecurringPayment from "../interfaces/RecurringPayment";
import type RecurringPaymentDatum from "../interfaces/RecurringPaymentDatum";

/**
 * Opaque datum handle — produced by the adapter, consumed by the adapter.
 */
export type EncodedDatum = Data.Data;

export interface ParsedAddress {
    bech32: string;
    paymentCredentialHash: string;
    stakeCredentialHash?: string;
    kind: "base" | "enterprise" | "reward";
    isValid: boolean;
    error?: string;
}

export interface DeriveScriptAddressParams {
    walletFrom: string;
    scriptHash: string;
    /** 0 = testnet/preprod/preview, 1 = mainnet. Defaults to env. */
    networkId?: number;
}

export interface BuildSetupContext {
    /** Raw CIP-30 api from useWallet(). Required. */
    walletApi: unknown;
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
    walletApi: unknown;
    payments: RecurringPayment[];
    /** Hex script hash (used as a tripwire — must match the applied script). */
    scriptHash: string;
    /** Raw (pre-param-application) UPLC hex, for inline-script spend. */
    scriptRawCode: string;
    scriptParameters: Array<{ cborHex: string }>;
    scriptVersion: "V1" | "V2" | "V3";
}

export interface ChainAdapter {
    parseAddress(bech32: string): ParsedAddress;
    deriveScriptAddress(params: DeriveScriptAddressParams): Promise<string>;
    encodeSetupDatum(dto: RecurringPaymentDatum): EncodedDatum;

    /** Build + sign + submit the setup transaction. Returns tx hash. */
    buildAndSubmitSetupTx(ctx: BuildSetupContext): Promise<string>;

    /** Build + sign + submit the cancel transaction. Returns tx hash. */
    buildCancelTx(ctx: BuildCancelContext): Promise<string>;
}
