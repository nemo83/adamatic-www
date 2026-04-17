/**
 * ChainAdapter factory — picks between Mesh (default) and Evolution SDK
 * based on NEXT_PUBLIC_CHAIN_ADAPTER. Both adapters are imported statically
 * because @evolution-sdk/evolution ships ESM only and Next 15 doesn't
 * allow `require()` across that boundary.
 *
 * Bundle-size note: both adapters end up in the main bundle. That's OK for
 * now — once Evolution passes Preprod smoke, we remove Mesh entirely.
 */
import type { ChainAdapter } from "./ChainAdapter";
import { getMeshChainAdapter } from "./MeshChainAdapter";
import { getEvolutionChainAdapter } from "./EvolutionChainAdapter";

let instance: ChainAdapter | null = null;

export function getChainAdapter(): ChainAdapter {
    if (!instance) {
        if (process.env.NEXT_PUBLIC_CHAIN_ADAPTER === "evolution") {
            instance = getEvolutionChainAdapter();
        } else {
            instance = getMeshChainAdapter();
        }
    }
    return instance;
}
