/**
 * Returns the active ChainAdapter. Phase C → Evolution.
 * Single source of truth so the SDK can be swapped via a one-line change.
 */
import type { ChainAdapter } from "./ChainAdapter";
import { getEvolutionChainAdapter } from "./EvolutionChainAdapter";

export function getChainAdapter(): ChainAdapter {
    return getEvolutionChainAdapter();
}
