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

    const prevAddrRef = useRef<string | null>(null);
    const prevNetRef = useRef<number | null>(null);

    const refreshInstalled = useCallback(() => {
        setInstalled(listInstalledWallets());
    }, []);

    // Pull bech32 address + networkId. Uses Mesh BrowserWallet because
    // CIP-30's getUsedAddresses returns hex. Falls back to getChangeAddress
    // for wallets with no transaction history yet (fresh accounts).
    const readWalletState = useCallback(
        async (api: Cip30Api, mesh: IWallet) => {
            const [used, change, net] = await Promise.all([
                Promise.resolve(mesh.getUsedAddresses()).catch(() => [] as string[]),
                Promise.resolve(mesh.getChangeAddress()).catch(() => ""),
                api.getNetworkId().catch(() => -1),
            ]);
            const primary = used[0] || change || null;
            setAddress(primary);
            setNetworkId(net >= 0 ? net : null);
            return { address: primary, networkId: net >= 0 ? net : null };
        },
        [],
    );

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
                await readWalletState(api, meshWallet);
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

    // Change detection via window 'focus' + document 'visibilitychange'.
    // On each event we re-enable the wallet (both CIP-30 api and the Mesh
    // wrapper) because they pin to the account that was active at connect
    // time — if the user switches account inside the extension, the old
    // handles go stale. Re-enabling returns fresh handles bound to the
    // currently-active account without prompting the user (the site is
    // already authorised). Drops the experimental.on subscription path;
    // focus events cover the same scenarios more reliably.
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
                const meshWallet = await BrowserWallet.enable(walletId);
                if (cancelled) return;
                setWallet(meshWallet);
                setWalletApi(api);
                const { address: next, networkId: nextNet } =
                    await readWalletState(api, meshWallet);
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
