/**
 * ScriptContext — fetches the protocol script manifest from the BE on mount
 * and caches it for the rest of the session. Replaces the hardcoded compiled
 * Plutus bytes + script hash that used to live in Constants.tsx.
 *
 * BE endpoint: GET {ADAMATIC_HOST}/scripts
 *
 * Response shape:
 *   { network: "preprod", protocols: [{ protocolId, title, version, scripts: [...] }] }
 *
 * Each script entry:
 *   { name, plutusVersion, rawCompiledCode, rawHash, parameters, finalHash }
 *
 * The FE primarily needs `finalHash` (for script-address derivation) and
 * `plutusVersion` + `rawCompiledCode` + `parameters` (for the inline-script
 * cancel path).
 */
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { fetchScripts } from "../api/adamatic";
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
    reload(): void;
}

const Ctx = createContext<ScriptContextValue | null>(null);

export const ScriptProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [manifest, setManifest] = useState<ScriptsPayload | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchScripts()
            .then((data) => {
                if (cancelled) return;
                if (data) {
                    setManifest(data);
                    return;
                }
                // BE unreachable / 404 → fall back to the bundled manifest
                // so the FE keeps working until the BE catches up.
                const fb = fallbackForNetwork(NETWORK);
                if (fb) {
                    console.warn(
                        "Scripts manifest fetch failed — using bundled fallback for network",
                        NETWORK,
                    );
                    setManifest(fb);
                } else {
                    setError("Failed to fetch scripts manifest");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [version]);

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
            loading,
            error,
            byName,
            reload: () => setVersion((v) => v + 1),
        }),
        [manifest, loading, error, byName],
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useScripts(): ScriptContextValue {
    const v = useContext(Ctx);
    if (!v)
        throw new Error("useScripts must be used inside <ScriptProvider>");
    return v;
}

export function useScriptByName(name: string): ScriptInfo | undefined {
    const { byName } = useScripts();
    return byName(name);
}
