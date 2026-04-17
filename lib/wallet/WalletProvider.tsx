/**
 * Custom wallet provider — replaces @meshsdk/react's MeshProvider.
 *
 * Manages:
 *   - Which CIP-30 wallet is connected (single selection at a time)
 *   - Persisted selection in localStorage (auto-reconnect on mount)
 *   - Account + network change detection (experimental.on + polling fallback)
 *   - Both a Mesh `BrowserWallet` (IWallet) AND the raw CIP-30 api are
 *     exposed via context, so existing code keeps working *and* the
 *     upcoming Evolution adapter can grab the raw api directly.
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
import { BrowserWallet } from "@meshsdk/core";
import type { IWallet } from "@meshsdk/core";
import type { Cip30Api, WalletInfo } from "./types";
import { getExtension, listInstalledWallets } from "./cip30";

const STORAGE_KEY = "adamatic.wallet";
const POLL_MS = 3000;

interface WalletState {
    /** Installed CIP-30 wallets in window.cardano (refreshed on connect). */
    installedWallets: WalletInfo[];
    /** Currently-connected wallet id, or null. */
    walletId: string | null;
    /** Mesh-shaped wallet, null when disconnected. */
    wallet: IWallet | null;
    /** Raw CIP-30 api, null when disconnected. */
    walletApi: Cip30Api | null;
    /** Primary used address, or null. */
    address: string | null;
    /** Reported network id (0 = testnet/preprod/preview, 1 = mainnet). */
    networkId: number | null;
    /** Connection is in-flight. */
    connecting: boolean;
    /** Last connection error (user-facing). */
    error: string | null;

    refreshInstalled: () => void;
    connect: (walletId: string) => Promise<void>;
    disconnect: () => void;
}

const Ctx = createContext<WalletState | null>(null);

export const useWalletContext = (): WalletState => {
    const v = useContext(Ctx);
    if (!v)
        throw new Error(
            "useWalletContext must be used inside <WalletProvider>",
        );
    return v;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [installedWallets, setInstalled] = useState<WalletInfo[]>([]);
    const [walletId, setWalletId] = useState<string | null>(null);
    const [wallet, setWallet] = useState<IWallet | null>(null);
    const [walletApi, setWalletApi] = useState<Cip30Api | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [networkId, setNetworkId] = useState<number | null>(null);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const prevAddrRef = useRef<string | null>(null);
    const prevNetRef = useRef<number | null>(null);

    const refreshInstalled = useCallback(() => {
        setInstalled(listInstalledWallets());
    }, []);

    // Pull current address + networkId from a live walletApi.
    const readWalletState = useCallback(async (api: Cip30Api) => {
        const [addrs, net] = await Promise.all([
            api.getUsedAddresses().catch(() => [] as string[]),
            api.getNetworkId().catch(() => -1),
        ]);
        // CIP-30 returns hex-encoded addresses; Mesh's BrowserWallet.getUsedAddresses
        // returns bech32. We normalise downstream via the adapter.
        const primary = addrs[0] ?? null;
        setAddress(primary);
        setNetworkId(net >= 0 ? net : null);
        return { address: primary, networkId: net >= 0 ? net : null };
    }, []);

    // Connect flow — shared by user-initiated and auto-reconnect paths.
    const doConnect = useCallback(
        async (id: string, silent: boolean) => {
            setConnecting(true);
            setError(null);
            try {
                const ext = getExtension(id);
                if (!ext) throw new Error(`Wallet "${id}" is not installed`);
                // Raw CIP-30 handle for the Evolution adapter.
                const api = (await ext.enable()) as Cip30Api;
                // Mesh wrapper for existing code.
                const meshWallet = await BrowserWallet.enable(id);

                setWalletId(id);
                setWallet(meshWallet);
                setWalletApi(api);
                await readWalletState(api);
                localStorage.setItem(STORAGE_KEY, id);
            } catch (e: any) {
                if (!silent) {
                    setError(e?.message ?? String(e));
                }
                // On silent failures, clear the stored id so we don't loop on it.
                if (silent) {
                    localStorage.removeItem(STORAGE_KEY);
                }
                setWalletId(null);
                setWallet(null);
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
        setWallet(null);
        setWalletApi(null);
        setAddress(null);
        setNetworkId(null);
        setError(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // On mount: enumerate installed wallets, then try to auto-reconnect.
    useEffect(() => {
        refreshInstalled();
        const stored =
            typeof window !== "undefined"
                ? localStorage.getItem(STORAGE_KEY)
                : null;
        if (!stored) return;
        const ext = getExtension(stored);
        if (!ext) return;
        (ext.isEnabled ? ext.isEnabled() : Promise.resolve(false))
            .then((enabled) => {
                if (enabled) {
                    doConnect(stored, /* silent */ true);
                }
            })
            .catch(() => {
                // Extension reported error on isEnabled — ignore, let user reconnect.
            });
    }, [doConnect, refreshInstalled]);

    // Change detection: experimental.on when supported, polling fallback
    // while the tab is visible. Runs only while a wallet is connected.
    useEffect(() => {
        if (!walletApi) return;

        let cancelled = false;
        prevAddrRef.current = address;
        prevNetRef.current = networkId;

        const handleChange = async () => {
            if (cancelled || !walletApi) return;
            try {
                const { address: next, networkId: nextNet } =
                    await readWalletState(walletApi);
                if (next !== prevAddrRef.current && prevAddrRef.current !== null) {
                    // Account changed inside the wallet — user switched address/account.
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
                /* swallow — transient wallet errors */
            }
        };

        const attemptEventSubscribe = (): (() => void) | undefined => {
            const on = walletApi.experimental?.on;
            const off = walletApi.experimental?.off;
            if (!on || !off) return undefined;
            try {
                on("accountChange", handleChange);
                on("networkChange", handleChange);
                return () => {
                    try {
                        off("accountChange", handleChange);
                        off("networkChange", handleChange);
                    } catch {
                        /* some wallets throw on off() — harmless */
                    }
                };
            } catch {
                return undefined;
            }
        };

        const unsub = attemptEventSubscribe();

        const poll = () => {
            if (document.visibilityState === "visible") {
                void handleChange();
            }
        };
        pollRef.current = setInterval(poll, POLL_MS);

        return () => {
            cancelled = true;
            unsub?.();
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletApi]);

    const value = useMemo<WalletState>(
        () => ({
            installedWallets,
            walletId,
            wallet,
            walletApi,
            address,
            networkId,
            connecting,
            error,
            refreshInstalled,
            connect,
            disconnect,
        }),
        [
            installedWallets,
            walletId,
            wallet,
            walletApi,
            address,
            networkId,
            connecting,
            error,
            refreshInstalled,
            connect,
            disconnect,
        ],
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
