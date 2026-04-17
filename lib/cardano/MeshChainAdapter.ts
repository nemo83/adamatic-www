/**
 * MeshSDK implementation of ChainAdapter. Wraps the existing TransactionUtil
 * logic so we can swap to Evolution SDK in Phase 4 by providing a second
 * implementation of this same interface.
 */
import {
    IWallet,
    PlutusScript,
    Recipient,
    Transaction,
} from "@meshsdk/core";
import { Address, AddressType } from "@meshsdk/core-cst";
import TransactionUtil from "../util/TransactionUtil";
import type {
    BuildCancelContext,
    BuildSetupContext,
    ChainAdapter,
    EncodedDatum,
    ParsedAddress,
} from "./ChainAdapter";
import type RecurringPaymentDatum from "../interfaces/RecurringPaymentDatum";

const USABLE_BASE_TYPES = new Set<AddressType>([
    AddressType.BasePaymentKeyStakeKey,
    AddressType.BasePaymentScriptStakeKey,
    AddressType.BasePaymentKeyStakeScript,
    AddressType.BasePaymentScriptStakeScript,
]);

const REWARD_TYPES = new Set<AddressType>([
    AddressType.RewardKey,
    AddressType.RewardScript,
]);

const ENTERPRISE_TYPES = new Set<AddressType>([
    AddressType.EnterpriseKey,
    AddressType.EnterpriseScript,
]);

class MeshAdapter implements ChainAdapter {
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
            const parsed = Address.fromBech32(bech32.trim());
            const type = parsed.getType();

            if (USABLE_BASE_TYPES.has(type)) {
                const base = parsed.asBase()!;
                return {
                    bech32: base.toAddress().toBech32().toString(),
                    paymentCredentialHash: base
                        .getPaymentCredential()
                        .hash.toString(),
                    stakeCredentialHash: base
                        .getStakeCredential()
                        .hash.toString(),
                    kind: "base",
                    isValid: true,
                };
            }

            if (REWARD_TYPES.has(type)) {
                const reward = parsed.asReward()!;
                return {
                    bech32: parsed.toBech32().toString(),
                    // For reward addresses the payment credential field on the
                    // CST node actually carries the stake credential hash.
                    paymentCredentialHash: reward
                        .getPaymentCredential()
                        .hash.toString(),
                    stakeCredentialHash: reward
                        .getPaymentCredential()
                        .hash.toString(),
                    kind: "reward",
                    isValid: true,
                };
            }

            if (ENTERPRISE_TYPES.has(type)) {
                const ent = parsed.asEnterprise()!;
                return {
                    bech32: parsed.toBech32().toString(),
                    paymentCredentialHash: ent
                        .getPaymentCredential()
                        .hash.toString(),
                    kind: "enterprise",
                    isValid: true,
                };
            }

            return {
                bech32,
                paymentCredentialHash: "",
                kind: "base",
                isValid: false,
                error: "Unsupported address type",
            };
        } catch (e) {
            return {
                bech32,
                paymentCredentialHash: "",
                kind: "base",
                isValid: false,
                error: "Invalid Cardano address format",
            };
        }
    }

    deriveScriptAddress(
        wallet: IWallet,
        script: PlutusScript,
        walletFrom: string,
    ): Promise<string> {
        return TransactionUtil.getScriptAddressWithStakeCredential(
            wallet,
            script,
            walletFrom,
        );
    }

    encodeSetupDatum(dto: RecurringPaymentDatum): EncodedDatum {
        return TransactionUtil.createDatum(dto);
    }

    async buildAndSubmitSetupTx(ctx: BuildSetupContext): Promise<string> {
        const { wallet, walletFromList, depositLovelace, datum } = ctx;

        // Lazy import to keep the script constant outside the adapter
        // module — we'll inline the reference once Phase 4 lands.
        const { SCRIPT } = await import("../util/Constants");

        let tx = new Transaction({ initiator: wallet });

        for (const walletFrom of walletFromList) {
            const scriptAddress = await this.deriveScriptAddress(
                wallet,
                SCRIPT,
                walletFrom,
            );
            const recipient: Recipient = {
                address: scriptAddress,
                datum: { value: datum, inline: true },
            };
            tx = tx.sendLovelace(recipient, String(depositLovelace));
        }

        const unsignedTx = await tx.build();
        const signedTx = await wallet.signTx(unsignedTx);
        return wallet.submitTx(signedTx);
    }

    buildCancelTx(ctx: BuildCancelContext): Promise<string> {
        return TransactionUtil.getUnsignedCancelTx(ctx.payments, ctx.wallet);
    }
}

/** Singleton factory. Flip to Evolution via NEXT_PUBLIC_CHAIN_ADAPTER=evolution. */
let instance: ChainAdapter | null = null;
export function getChainAdapter(): ChainAdapter {
    if (!instance) {
        if (process.env.NEXT_PUBLIC_CHAIN_ADAPTER === "evolution") {
            const mod = require("./EvolutionChainAdapter");
            instance = mod.getEvolutionChainAdapter();
        } else {
            instance = new MeshAdapter();
        }
    }
    return instance!;
}
