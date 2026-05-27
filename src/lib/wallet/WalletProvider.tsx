/**
 * Custom wallet provider.
 *
 *   - Persisted single-wallet selection in localStorage.
 *   - Auto-reconnect on mount when the extension reports `isEnabled`.
 *   - Account / network change detection on window focus + visibility
 *     (cheap, captures the user returning from the wallet popup).
 *
 * Exposes the raw CIP-30 api alongside the bech32-decoded primary address
 * and reported network id. The chain adapter consumes CIP-30 directly via
 * Evolution's `Client.withCip30`.
 */
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Address } from "@evolution-sdk/evolution";
import { initCardanoDAppConnectorBridge } from "@eternl/cardano-dapp-connector-bridge";
import type { Cip30Api, UseWalletResult, WalletInfo } from "./types";
import { getExtension, listInstalledWallets } from "./cip30";

const STORAGE_KEY = "adamatic.wallet";

const Ctx = createContext<UseWalletResult | null>(null);

export const useWalletContext = (): UseWalletResult => {
    const v = useContext(Ctx);
    if (!v)
        throw new Error("useWalletContext must be used inside <WalletProvider>");
    return v;
};

function hexAddressToBech32(hex: string | null | undefined): string | null {
    if (!hex) return null;
    try {
        const addr = Address.fromHex(hex);
        return Address.toBech32(addr);
    } catch {
        return null;
    }
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [installedWallets, setInstalled] = useState<WalletInfo[]>([]);
    const [walletId, setWalletId] = useState<string | null>(null);
    const [walletApi, setWalletApi] = useState<Cip30Api | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [networkId, setNetworkId] = useState<number | null>(null);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const prevAddrRef = useRef<string | null>(null);
    const prevNetRef = useRef<number | null>(null);

    const refreshInstalled = useCallback(() => {
        setInstalled(listInstalledWallets());
    }, []);

    const readWalletState = useCallback(async (api: Cip30Api) => {
        const [used, change, net] = await Promise.all([
            api.getUsedAddresses().catch(() => [] as string[]),
            api.getChangeAddress().catch(() => ""),
            api.getNetworkId().catch(() => -1),
        ]);
        const primary =
            hexAddressToBech32(used[0]) ?? hexAddressToBech32(change) ?? null;
        setAddress(primary);
        setNetworkId(net >= 0 ? net : null);
        return { address: primary, networkId: net >= 0 ? net : null };
    }, []);

    const doConnect = useCallback(
        async (id: string, silent: boolean) => {
            setConnecting(true);
            setError(null);
            try {
                const ext = getExtension(id);
                if (!ext) throw new Error(`Wallet "${id}" is not installed`);
                const api = (await ext.enable()) as Cip30Api;

                setWalletId(id);
                setWalletApi(api);
                await readWalletState(api);
                localStorage.setItem(STORAGE_KEY, id);
            } catch (e) {
                if (!silent) {
                    setError(e instanceof Error ? e.message : String(e));
                }
                if (silent) {
                    localStorage.removeItem(STORAGE_KEY);
                }
                setWalletId(null);
                setWalletApi(null);
                setAddress(null);
                setNetworkId(null);
            } finally {
                setConnecting(false);
            }
        },
        [readWalletState],
    );

    const connect = useCallback(
        (id: string) => doConnect(id, false),
        [doConnect],
    );

    const disconnect = useCallback(() => {
        setWalletId(null);
        setWalletApi(null);
        setAddress(null);
        setNetworkId(null);
        setError(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    /**
     * Auto-connect across all three Eternl surfaces (and any CIP-30 wallet):
     *
     *  1. Eternl **dApp browser** (eternl.io website + the iOS/Android app) loads
     *     us in an iframe/webview and delivers the wallet over a postMessage
     *     bridge — it does NOT inject `window.cardano.eternl`. We must init the
     *     bridge; on its handshake it populates `window.cardano.eternl` and fires
     *     our callback, at which point we list + auto-connect (the user already
     *     chose Eternl by opening us inside it). The bridge no-ops when
     *     `window.cardano.eternl` is already present, so it's harmless elsewhere.
     *  2. Browser **extensions** inject `window.cardano.<id>` asynchronously —
     *     often a few hundred ms after mount. Poll ~4s and reconnect the
     *     previously-stored wallet once it reports `isEnabled`.
     *
     * A single `connected` guard makes whichever path fires first win, so the
     * bridge and the stored-reconnect can't double-enable.
     */
    useEffect(() => {
        const stored =
            typeof window !== "undefined"
                ? localStorage.getItem(STORAGE_KEY)
                : null;

        let cancelled = false;
        const connected = { current: false };

        const autoConnect = (id: string, silent: boolean) => {
            if (cancelled || connected.current) return;
            connected.current = true;
            void doConnect(id, silent);
        };

        // 1. Eternl dApp browser / mobile app — bridge handshake.
        initCardanoDAppConnectorBridge(() => {
            if (cancelled) return;
            refreshInstalled();
            autoConnect("eternl", false);
        });

        // 2. Extensions (+ webviews that inject directly) — poll & reconnect.
        let attempts = 0;
        const MAX_ATTEMPTS = 20; // 20 × 200ms = 4s
        const tick = async () => {
            if (cancelled || connected.current) return;
            // Always refresh the installed list — fills the wallet picker
            // even if we have nothing stored to reconnect to.
            refreshInstalled();

            if (stored) {
                const ext = getExtension(stored);
                if (ext) {
                    try {
                        const enabled = await (ext.isEnabled
                            ? ext.isEnabled()
                            : Promise.resolve(false));
                        if (enabled) {
                            autoConnect(stored, true);
                            return;
                        }
                    } catch {
                        /* swallow — keep polling */
                    }
                }
            }

            if (attempts++ < MAX_ATTEMPTS) {
                setTimeout(tick, 200);
            }
        };
        tick();

        return () => {
            cancelled = true;
        };
    }, [doConnect, refreshInstalled]);

    useEffect(() => {
        if (!walletId) return;

        let cancelled = false;
        prevAddrRef.current = address;
        prevNetRef.current = networkId;

        const refresh = async () => {
            if (cancelled) return;
            const ext = getExtension(walletId);
            if (!ext) return;
            try {
                const api = (await ext.enable()) as Cip30Api;
                if (cancelled) return;
                setWalletApi(api);
                const { address: next, networkId: nextNet } =
                    await readWalletState(api);
                if (cancelled) return;
                if (
                    next !== prevAddrRef.current &&
                    prevAddrRef.current !== null
                ) {
                    prevAddrRef.current = next;
                    console.info("[wallet] account changed");
                }
                if (
                    nextNet !== prevNetRef.current &&
                    prevNetRef.current !== null
                ) {
                    prevNetRef.current = nextNet;
                    console.info("[wallet] network changed");
                }
            } catch {
                /* transient wallet errors — ignore */
            }
        };

        const onFocus = () => void refresh();
        const onVisibility = () => {
            if (document.visibilityState === "visible") void refresh();
        };
        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            cancelled = true;
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVisibility);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletId]);

    const value = useMemo<UseWalletResult>(
        () => ({
            wallet: walletApi,
            connected: walletApi !== null,
            address,
            networkId,
            installedWallets,
            walletId,
            connecting,
            error,
            connect,
            disconnect,
        }),
        [
            walletApi,
            address,
            networkId,
            installedWallets,
            walletId,
            connecting,
            error,
            connect,
            disconnect,
        ],
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
