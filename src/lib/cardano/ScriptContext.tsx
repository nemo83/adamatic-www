/**
 * ScriptContext — exposes the protocol script manifest to the rest of the
 * FE. The manifest is **bundled statically** (see `scriptManifestFallback`)
 * so consumers don't need to wait for a network round-trip and the FE keeps
 * working without any BE involvement.
 *
 * Each script entry:
 *   { name, plutusVersion, rawCompiledCode, rawHash, parameters, finalHash }
 *
 * The FE primarily needs `finalHash` (for script-address derivation) and
 * `plutusVersion` + `rawCompiledCode` + `parameters` (for the inline-script
 * cancel path).
 *
 * If/when a BE manifest endpoint comes online, swap the static `manifest`
 * lookup for an effectful fetch — the public hooks (`useScripts`,
 * `useScriptByName`) stay the same.
 */
import React, { createContext, useContext, useMemo } from "react";
import { fallbackForNetwork } from "./scriptManifestFallback";
import { NETWORK } from "./constants";

export interface ScriptParameter {
    title: string;
    schemaRef: string | null;
    cborHex: string;
}

export interface ScriptInfo {
    name: string;
    plutusVersion: "V1" | "V2" | "V3";
    rawCompiledCode: string;
    rawHash: string;
    parameters: ScriptParameter[];
    /** Post-parameter-application script hash. Use this for script addresses. */
    finalHash: string;
}

export interface ProtocolManifest {
    protocolId: string;
    title: string;
    version: string;
    scripts: ScriptInfo[];
}

export interface ScriptsPayload {
    network: "mainnet" | "preprod" | "preview" | string;
    protocols: ProtocolManifest[];
}

interface ScriptContextValue {
    manifest: ScriptsPayload | null;
    loading: boolean;
    error: string | null;
    byName(name: string): ScriptInfo | undefined;
    /** No-op — kept for API compatibility with the BE-driven version. */
    reload(): void;
}

const Ctx = createContext<ScriptContextValue | null>(null);

export const ScriptProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    // Resolved synchronously — no network, no loading state.
    const manifest = useMemo<ScriptsPayload | null>(
        () => fallbackForNetwork(NETWORK),
        [],
    );
    const error = manifest === null
        ? `No bundled script manifest for network "${NETWORK ?? "unknown"}"`
        : null;

    const byName = useMemo(
        () => (name: string) => {
            if (!manifest) return undefined;
            for (const p of manifest.protocols) {
                const hit = p.scripts.find((s) => s.name === name);
                if (hit) return hit;
            }
            return undefined;
        },
        [manifest],
    );

    const value = useMemo<ScriptContextValue>(
        () => ({
            manifest,
            loading: false,
            error,
            byName,
            reload: () => {},
        }),
        [manifest, error, byName],
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useScripts(): ScriptContextValue {
    const v = useContext(Ctx);
    if (!v) throw new Error("useScripts must be used inside <ScriptProvider>");
    return v;
}

export function useScriptByName(name: string): ScriptInfo | undefined {
    const { byName } = useScripts();
    return byName(name);
}
