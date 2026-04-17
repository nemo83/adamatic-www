/**
 * Custom wallet provider.
 *
 *   - Which CIP-30 wallet is connected (single selection at a time).
 *   - Persisted selection in localStorage; auto-reconnect on mount.
 *   - Account + network change detection on window focus / tab visibility
 *     (+ experimental.on subscription when the wallet supports it).
 *
 * Exposes only the raw CIP-30 api + decoded bech32 address. No Mesh
 * wrapper — the Evolution adapter consumes CIP-30 directly, and CIP-30
 * response decoding uses Evolution's address helpers.
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
import type { Cip30Api, WalletInfo } from "./types";
import { getExtension, listInstalledWallets } from "./cip30";

const STORAGE_KEY = "adamatic.wallet";

interface WalletState {
    installedWallets: WalletInfo[];
    /** Currently-connected wallet id, or null. */
    walletId: string | null;
    /** Raw CIP-30 api, null when disconnected. */
    walletApi: Cip30Api | null;
    /** Primary used address, bech32-decoded, or null. */
    address: string | null;
    /** Reported network id (0 = testnet, 1 = mainnet), or null. */
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

/**
 * CIP-30 `getUsedAddresses` + `getChangeAddress` return hex-encoded
 * addresses. Decode via Evolution's Address.fromHex/toBech32.
 * Returns null when the hex is invalid or empty.
 */
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

    // Pull bech32 address + networkId from a CIP-30 api. Falls back to
    // the change address for fresh wallets with no tx history yet.
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
            } catch (e: any) {
                if (!silent) {
                    setError(e?.message ?? String(e));
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

    // Auto-reconnect on mount if the wallet is still enabled.
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
                if (enabled) doConnect(stored, true);
            })
            .catch(() => void 0);
    }, [doConnect, refreshInstalled]);

    // Change detection: focus + visibility + experimental.on.
    // On each event we re-enable the wallet (fresh api handle bound to
    // the currently-active account) and re-read state.
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

    const value = useMemo<WalletState>(
        () => ({
            installedWallets,
            walletId,
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
