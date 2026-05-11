/**
 * Network-aware cexplorer.io URL builder.
 *
 * cexplorer uses subdomains for testnets:
 *   mainnet → https://cexplorer.io
 *   preprod → https://preprod.cexplorer.io
 *   preview → https://preview.cexplorer.io
 *
 * Path conventions (different from cardanoscan):
 *   /tx/{hash}       — transactions  (cardanoscan: /transaction/)
 *   /address/{addr}  — payment addresses
 *   /stake/{addr}    — stake addresses (cardanoscan: /stakekey/)
 *   /pool/{poolId}   — stake pools
 */

import { NETWORK } from "./constants";

const SUBDOMAIN: Record<string, string> = {
    mainnet: "",
    preprod: "preprod.",
    preview: "preview.",
};

function base(): string {
    const sub = SUBDOMAIN[(NETWORK ?? "mainnet").toLowerCase()] ?? "";
    return `https://${sub}cexplorer.io`;
}

export const explorerUrl = {
    home: () => base(),
    tx: (hash: string) => `${base()}/tx/${hash}`,
    address: (addr: string) => `${base()}/address/${addr}`,
    stake: (stakeAddr: string) => `${base()}/stake/${stakeAddr}`,
    pool: (poolId: string) => `${base()}/pool/${poolId}`,
};
