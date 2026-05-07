/**
 * CIP-30 utilities — enumerate installed wallets, normalise labels.
 */
import type { Cip30Extension, WalletInfo } from "./types";

const LABEL_OVERRIDES: Record<string, string> = {
    eternl: "Eternl",
    nami: "Nami",
    lace: "Lace",
    flint: "Flint",
    typhoncip30: "Typhon",
    typhon: "Typhon",
    gerowallet: "Gero",
    nufi: "NuFi",
    vespr: "Vespr",
    yoroi: "Yoroi",
};

function displayLabel(id: string, ext: Cip30Extension): string {
    if (LABEL_OVERRIDES[id]) return LABEL_OVERRIDES[id];
    if (ext.name) return ext.name;
    return id.charAt(0).toUpperCase() + id.slice(1);
}

export function listInstalledWallets(): WalletInfo[] {
    if (typeof window === "undefined" || !window.cardano) return [];
    const cardano = window.cardano as unknown as Record<string, Cip30Extension>;
    return Object.entries(cardano)
        .filter(([, ext]) => ext && typeof ext.enable === "function")
        .map(([id, ext]) => ({
            id,
            label: displayLabel(id, ext),
            icon: ext.icon,
            apiVersion: ext.apiVersion,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
}

export function getExtension(id: string): Cip30Extension | undefined {
    if (typeof window === "undefined") return undefined;
    const cardano = window.cardano as unknown as Record<string, Cip30Extension>;
    return cardano?.[id];
}
