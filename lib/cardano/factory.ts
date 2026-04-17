/**
 * ChainAdapter factory — Evolution SDK only, post-Mesh-removal.
 * Kept as a factory so tests can inject a mock implementation.
 */
import type { ChainAdapter } from "./ChainAdapter";
import { getEvolutionChainAdapter } from "./EvolutionChainAdapter";

let instance: ChainAdapter | null = null;

export function getChainAdapter(): ChainAdapter {
    if (!instance) instance = getEvolutionChainAdapter();
    return instance;
}
