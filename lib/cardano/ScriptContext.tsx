/**
 * ScriptContext — fetches the protocol script manifest from the BE on mount
 * and caches it for the rest of the session. Replaces the hardcoded compiled
 * Plutus bytes + script hash that used to live in Constants.tsx.
 *
 * BE endpoint: GET {ADAMATIC_HOST}/scripts
 *
 * Response shape (as of 2026-04-17):
 *   { network: "preprod", protocols: [{ protocolId, title, version, scripts: [...] }] }
 *
 * Each script entry:
 *   { name, plutusVersion, rawCompiledCode, rawHash, parameters, finalHash }
 *
 * The FE only needs `finalHash` (for script-address derivation) and
 * `plutusVersion`. Everything else is metadata we keep around in case a
 * future feature (reference-script deploy, blueprint introspection) wants it.
 */
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { ADAMATIC_HOST } from "../util/Constants";

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
    /** Find a script by its canonical name across all protocols. */
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
        fetch(ADAMATIC_HOST + "/scripts")
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((data: ScriptsPayload) => {
                if (!cancelled) setManifest(data);
            })
            .catch((err) => {
                if (!cancelled) {
                    console.warn("Scripts manifest fetch failed:", err);
                    setError(err?.message ?? String(err));
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
