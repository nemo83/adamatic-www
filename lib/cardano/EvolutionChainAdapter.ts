/**
 * Evolution SDK implementation of ChainAdapter.
 *
 * Script address derivation uses the BE-provided `finalHash` directly —
 * no client-side CBOR wrapping, no Plutus bytes in the client bundle.
 */
import {
    Address,
    AddressEras,
    BaseAddress,
    Bytes,
    Data,
    InlineDatum,
    KeyHash,
    ScriptHash,
    Client,
    Assets,
    type Chain,
    mainnet,
    preprod,
    preview,
} from "@evolution-sdk/evolution";
import type RecurringPaymentDatum from "../interfaces/RecurringPaymentDatum";
import type {
    BuildCancelContext,
    BuildSetupContext,
    ChainAdapter,
    DeriveScriptAddressParams,
    EncodedDatum,
    ParsedAddress,
} from "./ChainAdapter";
import { BLOCKFROST_API_KEY, NETWORK } from "../util/Constants";

const CHAIN_BY_NAME: Record<string, Chain> = {
    mainnet,
    preprod,
    preview,
};

function currentChain(): Chain {
    const key = (NETWORK ?? "mainnet").toLowerCase();
    return CHAIN_BY_NAME[key] ?? preprod;
}

function currentNetworkId(): number {
    const key = (NETWORK ?? "mainnet").toLowerCase();
    return key === "mainnet" ? 1 : 0;
}

function credentialHex(cred: KeyHash.KeyHash | ScriptHash.ScriptHash): string {
    return Bytes.toHex(cred.hash);
}

/**
 * Build a bech32 script address from a script hash + stake credential.
 * Exported so the Mesh adapter can use the same machinery (we already ship
 * @evolution-sdk/evolution, no point having two address builders).
 */
export function deriveScriptAddressBech32(
    params: DeriveScriptAddressParams,
): string {
    const { walletFrom, scriptHash } = params;
    const networkId = params.networkId ?? currentNetworkId();

    const stakeHex = extractStakeCredentialHex(walletFrom);
    if (!stakeHex) {
        throw new Error("walletFrom is missing a stake credential");
    }

    const paymentCredential = new ScriptHash.ScriptHash({
        hash: Bytes.fromHex(scriptHash),
    });
    const stakeCredential = new KeyHash.KeyHash({
        hash: Bytes.fromHex(stakeHex),
    });

    const baseAddr = new BaseAddress.BaseAddress({
        networkId,
        paymentCredential,
        stakeCredential,
    });
    return AddressEras.toBech32(baseAddr);
}

function extractStakeCredentialHex(bech32: string): string | null {
    try {
        const addr = Address.fromBech32(bech32);
        if (!addr.stakingCredential) return null;
        return Bytes.toHex((addr.stakingCredential as any).hash as Uint8Array);
    } catch {
        // May be a reward address — try RewardAccount if available.
        try {
            const RewardAccount = (require("@evolution-sdk/evolution") as any)
                .RewardAccount;
            if (RewardAccount?.fromBech32) {
                const reward = RewardAccount.fromBech32(bech32);
                return Bytes.toHex((reward.stakeCredential as any).hash as Uint8Array);
            }
        } catch {
            // fallthrough
        }
        return null;
    }
}

/** Encode the recurring-payment datum. Verified byte-compat with the Mesh impl. */
function encodePlutusAddress(bech32: string): Data.Data {
    const addr = Address.fromBech32(bech32);
    const paymentHash = (addr.paymentCredential as any).hash as Uint8Array;
    const paymentCredCtor = Data.constr(0n, [paymentHash]);
    const stakingOpt = addr.stakingCredential
        ? Data.constr(0n, [
              Data.constr(0n, [
                  Data.constr(0n, [
                      (addr.stakingCredential as any).hash as Uint8Array,
                  ]),
              ]),
          ])
        : Data.constr(1n, []);
    return Data.constr(0n, [paymentCredCtor, stakingOpt]);
}

class EvolutionAdapter implements ChainAdapter {
    parseAddress(bech32: string): ParsedAddress {
        if (!bech32 || !bech32.trim()) {
            return {
                bech32,
                paymentCredentialHash: "",
                kind: "base",
                isValid: false,
            };
        }
        try {
            const addr = Address.fromBech32(bech32.trim());
            const hasStake = addr.stakingCredential !== undefined;
            const kind: ParsedAddress["kind"] = hasStake ? "base" : "enterprise";
            return {
                bech32: Address.toBech32(addr),
                paymentCredentialHash: credentialHex(addr.paymentCredential),
                stakeCredentialHash: hasStake
                    ? credentialHex(addr.stakingCredential!)
                    : undefined,
                kind,
                isValid: true,
            };
        } catch {
            /* fall through */
        }

        try {
            const RewardAccount = (require("@evolution-sdk/evolution") as any)
                .RewardAccount;
            if (RewardAccount?.fromBech32) {
                const reward = RewardAccount.fromBech32(bech32.trim());
                const hex = Bytes.toHex(
                    (reward.stakeCredential as any).hash as Uint8Array,
                );
                return {
                    bech32: bech32.trim(),
                    paymentCredentialHash: hex,
                    stakeCredentialHash: hex,
                    kind: "reward",
                    isValid: true,
                };
            }
        } catch {
            /* fall through */
        }

        return {
            bech32,
            paymentCredentialHash: "",
            kind: "base",
            isValid: false,
            error: "Invalid Cardano address format",
        };
    }

    async deriveScriptAddress(
        params: DeriveScriptAddressParams,
    ): Promise<string> {
        return deriveScriptAddressBech32(params);
    }

    encodeSetupDatum(dto: RecurringPaymentDatum): EncodedDatum {
        if (!dto.ownerPaymentPubKeyHash || !dto.payee) {
            throw new Error("Missing ownerPaymentPubKeyHash or payee");
        }
        const ownerHash = Bytes.fromHex(dto.ownerPaymentPubKeyHash);
        const payeeAddrData = encodePlutusAddress(dto.payee);

        const a0 = dto.amountToSend[0];
        const assetsField =
            a0 !== undefined
                ? [
                      Data.constr(0n, [
                          Bytes.fromHex(a0.policyId || ""),
                          Bytes.fromHex(a0.assetName || ""),
                          BigInt(a0.amount),
                      ]),
                  ]
                : [];

        const startTime = BigInt(dto.startTime);
        const endTimeData =
            dto.endTime !== undefined
                ? Data.constr(0n, [BigInt(dto.endTime)])
                : Data.constr(1n, []);
        const paymentIntervalData =
            dto.paymentIntervalHours !== undefined
                ? Data.constr(0n, [BigInt(dto.paymentIntervalHours)])
                : Data.constr(1n, []);
        const maxDelayData =
            dto.maxPaymentDelayHours !== undefined
                ? Data.constr(0n, [BigInt(dto.maxPaymentDelayHours)])
                : Data.constr(1n, []);
        const maxFees = BigInt(dto.maxFeesLovelace);

        const datum = Data.constr(0n, [
            ownerHash,
            assetsField,
            payeeAddrData,
            startTime,
            endTimeData,
            paymentIntervalData,
            maxDelayData,
            maxFees,
        ]);
        return datum as unknown as EncodedDatum;
    }

    async buildAndSubmitSetupTx(ctx: BuildSetupContext): Promise<string> {
        if (!ctx.walletApi) {
            throw new Error(
                "Evolution adapter requires a CIP-30 walletApi — pass it from useWallet()",
            );
        }
        const client = buildClient(ctx.walletApi);

        let builder = client.newTx();
        for (const walletFrom of ctx.walletFromList) {
            const scriptAddressBech32 = deriveScriptAddressBech32({
                walletFrom,
                scriptHash: ctx.scriptHash,
            });
            const scriptAddress = Address.fromBech32(scriptAddressBech32);
            builder = builder.payToAddress({
                address: scriptAddress,
                assets: Assets.fromLovelace(BigInt(ctx.depositLovelace)),
                datum: new InlineDatum.InlineDatum({
                    data: ctx.datum as unknown as Data.Data,
                }),
            });
        }

        const signBuilder = await builder.build();
        const submitBuilder = await signBuilder.sign();
        const hash = await submitBuilder.submit();
        const { TransactionHash } = await import("@evolution-sdk/evolution");
        return TransactionHash.toHex(hash);
    }

    async buildCancelTx(_ctx: BuildCancelContext): Promise<string> {
        throw new Error(
            "Evolution buildCancelTx: pending reference-script UTxO from the BE `/scripts` endpoint",
        );
    }
}

/** CBOR hex of an encoded datum — used by the byte-compat test to diff against Mesh. */
export function datumToCborHex(datum: EncodedDatum): string {
    return Data.toCBORHex(datum as unknown as Data.Data);
}

let instance: EvolutionAdapter | null = null;
export function getEvolutionChainAdapter(): ChainAdapter {
    if (!instance) {
        instance = new EvolutionAdapter();
    }
    return instance;
}

export function buildClient(walletApi: unknown) {
    if (!BLOCKFROST_API_KEY) {
        throw new Error(
            "NEXT_PUBLIC_BLOCKFROST_API_KEY is required to build transactions on the client",
        );
    }
    const chain = currentChain();
    const baseUrl =
        chain === mainnet
            ? "https://cardano-mainnet.blockfrost.io/api/v0"
            : chain === preview
              ? "https://cardano-preview.blockfrost.io/api/v0"
              : "https://cardano-preprod.blockfrost.io/api/v0";
    return Client.make(chain)
        .withBlockfrost({ baseUrl, projectId: BLOCKFROST_API_KEY })
        .withCip30(walletApi as any);
}
