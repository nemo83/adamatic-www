/**
 * Evolution SDK implementation of ChainAdapter.
 *
 * Script address derivation uses the BE-provided `finalHash` directly —
 * no client-side CBOR wrapping, no Plutus bytes in the client bundle.
 * The cancel path applies parameters client-side (inline-script tx) since
 * the BE doesn't expose a reference-script UTxO yet.
 */
import {
    Address,
    AddressEras,
    Assets,
    BaseAddress,
    Bytes,
    Client,
    Data,
    InlineDatum,
    KeyHash,
    PlutusV1,
    PlutusV2,
    PlutusV3,
    RewardAccount,
    ScriptHash,
    TransactionHash,
    TransactionInput,
    UPLC,
    mainnet,
    preprod,
    preview,
    type Chain,
} from "@evolution-sdk/evolution";
import type {
    BuildCancelContext,
    BuildSetupContext,
    ChainAdapter,
    DeriveScriptAddressParams,
    EncodedDatum,
    ParsedAddress,
} from "./ChainAdapter";
import type { RecurringPaymentDatum } from "../../types/RecurringPaymentDatum";
import { BLOCKFROST_API_KEY, NETWORK } from "./constants";

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
        const parsed = AddressEras.fromBech32(bech32);
        switch (parsed._tag) {
            case "BaseAddress":
                return Bytes.toHex(
                    (parsed.stakeCredential as { hash: Uint8Array }).hash,
                );
            case "RewardAccount":
                return Bytes.toHex(
                    (parsed.stakeCredential as { hash: Uint8Array }).hash,
                );
            default:
                return null;
        }
    } catch {
        return null;
    }
}

function encodePlutusAddress(bech32: string): Data.Data {
    const addr = Address.fromBech32(bech32);
    const paymentHash = (addr.paymentCredential as { hash: Uint8Array }).hash;
    const paymentCredCtor = Data.constr(0n, [paymentHash]);
    const stakingOpt = addr.stakingCredential
        ? Data.constr(0n, [
              Data.constr(0n, [
                  Data.constr(0n, [
                      (addr.stakingCredential as { hash: Uint8Array }).hash,
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
        const trimmed = bech32.trim();
        try {
            // AddressEras.fromBech32 handles every modern address type — base,
            // enterprise, reward (`stake1...`/`stake_test1...`), pointer,
            // byron — returning a tagged union we can switch on.
            const parsed = AddressEras.fromBech32(trimmed);
            switch (parsed._tag) {
                case "BaseAddress":
                    return {
                        bech32: AddressEras.toBech32(parsed),
                        paymentCredentialHash: credentialHex(parsed.paymentCredential),
                        stakeCredentialHash: credentialHex(parsed.stakeCredential),
                        kind: "base",
                        isValid: true,
                    };
                case "EnterpriseAddress":
                    return {
                        bech32: AddressEras.toBech32(parsed),
                        paymentCredentialHash: credentialHex(parsed.paymentCredential),
                        kind: "enterprise",
                        isValid: true,
                    };
                case "RewardAccount": {
                    const hex = credentialHex(parsed.stakeCredential);
                    return {
                        bech32: RewardAccount.toBech32(parsed),
                        // Reward addresses have no payment credential — surface
                        // the stake hash in both fields so callers that key on
                        // `paymentCredentialHash` (e.g. /recurring_payments/public_key_hash/…)
                        // still work for users who only paste their stake address.
                        paymentCredentialHash: hex,
                        stakeCredentialHash: hex,
                        kind: "reward",
                        isValid: true,
                    };
                }
                default:
                    return {
                        bech32: trimmed,
                        paymentCredentialHash: "",
                        kind: "base",
                        isValid: false,
                        error: `Unsupported address kind (${parsed._tag})`,
                    };
            }
        } catch {
            return {
                bech32: trimmed,
                paymentCredentialHash: "",
                kind: "base",
                isValid: false,
                error: "Invalid Cardano address format",
            };
        }
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
        if (!ctx.wallet) {
            throw new Error("Evolution adapter requires a CIP-30 walletApi");
        }
        if (!ctx.scriptHash) {
            throw new Error(
                "Evolution adapter requires `scriptHash` (BE manifest finalHash) — pass it from useScriptByName(\"automatic_payments\")",
            );
        }
        const client = buildClient(ctx.wallet);

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
        return TransactionHash.toHex(hash);
    }

    async buildAndSubmitCancelTx(ctx: BuildCancelContext): Promise<string> {
        if (!ctx.wallet) {
            throw new Error("Evolution adapter requires a CIP-30 walletApi");
        }
        if (!ctx.scriptRawCode || !ctx.scriptParameters || !ctx.scriptVersion) {
            throw new Error(
                "Evolution buildAndSubmitCancelTx needs scriptRawCode + scriptParameters + scriptVersion (inline-script path)",
            );
        }

        const client = buildClient(ctx.wallet);

        // Apply params client-side. `applyParamsToScript` returns hex that
        // still needs `applySingleCborEncoding` to reach the form the Cardano
        // protocol hashes on-chain (matches the BE's `finalHash`). Determined
        // empirically — single-wrapped output was the only hash that matched.
        const params = ctx.scriptParameters.map((p) =>
            Data.fromCBORHex(p.cborHex),
        );
        const appliedRawHex = UPLC.applyParamsToScript(
            ctx.scriptRawCode,
            params,
        );
        const normalisedHex = UPLC.applySingleCborEncoding(appliedRawHex);
        const appliedBytes = Bytes.fromHex(normalisedHex);

        const script =
            ctx.scriptVersion === "V3"
                ? new PlutusV3.PlutusV3({ bytes: appliedBytes })
                : ctx.scriptVersion === "V2"
                  ? new PlutusV2.PlutusV2({ bytes: appliedBytes })
                  : new PlutusV1.PlutusV1({ bytes: appliedBytes });

        // Tripwire: if the applied hash ever drifts from `finalHash`, fail
        // fast instead of submitting a tx the validator will reject.
        const computedHash = Bytes.toHex(
            ScriptHash.fromScript(script as unknown as Parameters<typeof ScriptHash.fromScript>[0]).hash,
        );
        if (computedHash.toLowerCase() !== ctx.scriptHash.toLowerCase()) {
            throw new Error(
                `Applied script hash ${computedHash} != BE finalHash ${ctx.scriptHash}. ` +
                    `Param-application convention may have changed — check @evolution-sdk/evolution release notes.`,
            );
        }

        const inputs = ctx.payments.map(
            (p) =>
                new TransactionInput.TransactionInput({
                    transactionId: TransactionHash.fromHex(p.txHash),
                    index: BigInt(p.output_index),
                }),
        );
        const scriptUtxos = await (
            client as unknown as {
                getUtxosByOutRef(
                    inputs: TransactionInput.TransactionInput[],
                ): Promise<unknown[]>;
            }
        ).getUtxosByOutRef(inputs);
        if (!scriptUtxos || scriptUtxos.length === 0) {
            throw new Error(
                "Couldn't fetch any of the target script UTxOs (backend / Blockfrost reachable?)",
            );
        }

        const walletAddr = await (
            client as unknown as { address(): Promise<string | Address.Address> }
        ).address();
        const walletAddrBech32 =
            typeof walletAddr === "string"
                ? walletAddr
                : Address.toBech32(walletAddr);
        const ownerParsed = this.parseAddress(walletAddrBech32);
        if (!ownerParsed.isValid) {
            throw new Error("Can't parse connected wallet address");
        }
        const signerKeyHash = new KeyHash.KeyHash({
            hash: Bytes.fromHex(ownerParsed.paymentCredentialHash),
        });

        const builder = client
            .newTx()
            .collectFrom({
                inputs: scriptUtxos as Parameters<
                    ReturnType<typeof client.newTx>["collectFrom"]
                >[0]["inputs"],
                redeemer: Data.constr(0n, []),
            })
            .attachScript({ script })
            .addSigner({ keyHash: signerKeyHash });

        const signBuilder = await builder.build();
        const submitBuilder = await signBuilder.sign();
        const hash = await submitBuilder.submit();
        return TransactionHash.toHex(hash);
    }
}

/** CBOR hex of an encoded datum — exposed for byte-compat verification. */
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

function buildClient(walletApi: unknown) {
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
        .withCip30(walletApi as Parameters<ReturnType<typeof Client.make>["withCip30"]>[0]);
}
