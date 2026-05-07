/**
 * Returns the active ChainAdapter. Phase B → Mesh; Phase C → Evolution.
 * Single source of truth so the SDK swap is a one-line change.
 */
import type { ChainAdapter } from "./ChainAdapter";
import { getMeshChainAdapter } from "./MeshChainAdapter";

export function getChainAdapter(): ChainAdapter {
    return getMeshChainAdapter();
}
