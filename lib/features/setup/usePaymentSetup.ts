/**
 * usePaymentSetup — ports the state + side-effect logic from the retired
 * UserInput / SetupRecurringPayment MUI pair into a headless hook.
 *
 * Consumers: the Ledger stepper pages/steps (pages/setup.tsx +
 * lib/features/setup/steps/*). Nothing here renders UI.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import toast from "react-hot-toast";
import { useWallet } from "../../wallet/useWallet";
import { getChainAdapter } from "../../cardano/factory";
import { useScriptByName } from "../../cardano/ScriptContext";
import { ADAMATIC_HOST } from "../../util/Constants";
import type AssetAmount from "../../interfaces/AssetAmount";
import type RecurringPaymentDatum from "../../interfaces/RecurringPaymentDatum";
import type { HoskyTemplate, Settings } from "../../interfaces/AdaMaticTypes";
import type {
    PaymentSetupState,
    PaymentSetupDerived,
    WalletRow,
} from "./types";

const LOVELACE_PER_ADA = 1_000_000;
const MAX_PULLS = 50;

export interface UsePaymentSetupOptions {
    mode: "hosky" | "generic";
}

export interface UsePaymentSetupResult {
    state: PaymentSetupState;
    derived: PaymentSetupDerived;
    submitting: boolean;
    txHash: string | null;

    // wallet list
    addWallet(): void;
    removeWallet(index: number): void;
    updateWallet(index: number, value: string): void;

    // primary fields
    setPayee(value: string): void;
    setAmountToSend(value: AssetAmount[]): void;
    setStartTime(value: Dayjs | null): void;
    setEndTime(value: Dayjs | null): void;
    setMaxFeesLovelace(value: number): void;
    setNumPulls(value: number): void;
    setPaymentIntervalEpochs(value: number): void;

    // consent
    setAcceptRisk(value: boolean): void;
    setAcceptFees(value: boolean): void;

    submit(): Promise<void>;
}

export function usePaymentSetup(
    opts: UsePaymentSetupOptions,
): UsePaymentSetupResult {
    const { mode } = opts;
    const isHosky = mode === "hosky";
    const { wallet, walletApi, connected, networkId } = useWallet();
    const automaticPayments = useScriptByName("automatic_payments");

    // ------------- state -------------
    const [walletFromList, setWalletFromList] = useState<string[]>([""]);
    const [walletRows, setWalletRows] = useState<WalletRow[]>([
        { address: "", status: "empty" },
    ]);
    const [isDelegatedToHosky, setIsDelegatedToHosky] = useState<boolean>(true);

    const [payee, setPayee] = useState<string>("");
    const [amountToSend, setAmountToSend] = useState<AssetAmount[]>([
        { policyId: "", assetName: "", amount: 2_000_000 },
    ]);
    const [maxFeesLovelace, setMaxFeesLovelace] = useState<number>(1_000_000);

    const [startTime, setStartTime] = useState<Dayjs | null>(dayjs());
    const [endTime, setEndTime] = useState<Dayjs | null>(null);
    const [paymentIntervalHours, setPaymentIntervalHours] = useState<number>(1);
    const [paymentIntervalEpochs, setPaymentIntervalEpochs] = useState<number>(1);
    const [lockEndTime, setLockEndTime] = useState<boolean>(false);

    const [epochStart, setEpochStart] = useState<number>(0);
    const [epochEnd, setEpochEnd] = useState<number>(0);
    const [numPulls, setNumPulls] = useState<number>(1);

    const [deposit, setDeposit] = useState<number>(0);

    const [acceptRisk, setAcceptRisk] = useState<boolean>(false);
    const [acceptFees, setAcceptFees] = useState<boolean>(false);

    const [settings, setSettings] = useState<Settings | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    // ------------- seed initial wallet-from list from the connected wallet -------------
    useEffect(() => {
        if (!connected || !wallet) return;
        wallet
            .getUsedAddresses()
            .then((addrs) => {
                const chain = getChainAdapter();
                const parsed = chain.parseAddress(addrs[0] ?? "");
                if (!parsed.isValid) return;
                if (walletFromList.length > 0 && walletFromList[0] === "") {
                    setWalletFromList([parsed.bech32]);
                }
            })
            .catch(() => void 0);
    }, [connected, wallet]); // eslint-disable-line react-hooks/exhaustive-deps

    // ------------- settings -------------
    useEffect(() => {
        fetch(ADAMATIC_HOST + "/settings")
            .then((r) => (r.ok ? r.json() : null))
            .then((data: Settings | null) => {
                if (data) setSettings(data);
            })
            .catch((err) => {
                console.warn("settings fetch failed:", err);
            });
    }, []);

    // ------------- Hosky template (initial load + param updates) -------------
    const updateFormFromTemplate = useCallback((data: HoskyTemplate) => {
        setEpochStart(data.epoch_start);
        setEpochEnd(data.epoch_end);
        setNumPulls(
            Math.floor(
                (data.epoch_end - data.epoch_start) / data.epoch_frequency,
            ),
        );
        if (data.suggested_deposit?.[0]?.amount !== undefined) {
            setDeposit(data.suggested_deposit[0].amount);
        }
        if (data.payee_address) setPayee(data.payee_address);
        if (data.start_time_timestamp)
            setStartTime(dayjs(data.start_time_timestamp));
        if (data.end_time_timestamp) setEndTime(dayjs(data.end_time_timestamp));
        setPaymentIntervalHours(data.payment_interval_hours);
        setPaymentIntervalEpochs(data.epoch_frequency);
        setMaxFeesLovelace(data.max_fee_lovelaces);
        setLockEndTime(data.lock_end_time);
        if (data.amount_to_send?.length > 0)
            setAmountToSend(data.amount_to_send);
    }, []);

    // Initial Hosky template fetch.
    useEffect(() => {
        if (!isHosky) return;
        fetch(ADAMATIC_HOST + "/recurring_payments/template/hosky")
            .then((r) => (r.ok ? r.json() : null))
            .then((data: HoskyTemplate | null) => {
                if (data) updateFormFromTemplate(data);
            })
            .catch((err) => {
                console.warn("Hosky template fetch failed:", err);
            });
    }, [isHosky, updateFormFromTemplate]);

    // Re-fetch template when the user adjusts a param the BE cares about.
    const reCompute = useCallback(
        (nextMaxFees: number, nextEpochStart: number, nextNumPulls: number, nextFreq: number) => {
            if (!isHosky) return;
            if (
                [nextMaxFees, nextEpochStart, nextNumPulls, nextFreq].some(
                    (v) => v == null || Number.isNaN(v),
                )
            )
                return;
            const qs = new URLSearchParams({
                max_fees: nextMaxFees.toString(),
                epoch_start: nextEpochStart.toString(),
                num_pulls: nextNumPulls.toString(),
                epoch_frequency: nextFreq.toString(),
            });
            fetch(ADAMATIC_HOST + "/recurring_payments/template/hosky?" + qs)
                .then((r) => (r.ok ? r.json() : null))
                .then((data: HoskyTemplate | null) => {
                    if (data) updateFormFromTemplate(data);
                })
                .catch(() => void 0);
        },
        [isHosky, updateFormFromTemplate],
    );

    const setMaxFeesWithRecompute = useCallback(
        (next: number) => {
            setMaxFeesLovelace(next);
            reCompute(next, epochStart, numPulls, paymentIntervalEpochs);
        },
        [reCompute, epochStart, numPulls, paymentIntervalEpochs],
    );

    const setNumPullsWithRecompute = useCallback(
        (next: number) => {
            const clamped = Math.max(1, Math.min(MAX_PULLS, next));
            setNumPulls(clamped);
            reCompute(maxFeesLovelace, epochStart, clamped, paymentIntervalEpochs);
        },
        [reCompute, maxFeesLovelace, epochStart, paymentIntervalEpochs],
    );

    const setPaymentIntervalEpochsWithRecompute = useCallback(
        (next: number) => {
            const clamped = Math.max(1, next);
            setPaymentIntervalEpochs(clamped);
            reCompute(maxFeesLovelace, epochStart, numPulls, clamped);
        },
        [reCompute, maxFeesLovelace, epochStart, numPulls],
    );

    // ------------- wallet-from list helpers -------------
    const addWallet = useCallback(() => {
        setWalletFromList((xs) => [...xs, ""]);
    }, []);

    const removeWallet = useCallback((index: number) => {
        setWalletFromList((xs) =>
            xs.length > 1 ? xs.filter((_, i) => i !== index) : xs,
        );
    }, []);

    const updateWallet = useCallback((index: number, value: string) => {
        setWalletFromList((xs) => {
            const copy = xs.length > 0 ? [...xs] : [""];
            copy[index] = value;
            return copy;
        });
    }, []);

    // ------------- validation + delegation check on the wallet list -------------
    useEffect(() => {
        if (walletFromList.length === 0) return;
        const chain = getChainAdapter();

        let cancelled = false;
        (async () => {
            const rows: WalletRow[] = [];
            let anyInvalid = false;
            let anyNotDelegated = false;

            for (const address of walletFromList) {
                if (!address || !address.trim()) {
                    rows.push({ address, status: "empty" });
                    anyInvalid = true;
                    continue;
                }
                const parsed = chain.parseAddress(address);
                if (!parsed.isValid) {
                    rows.push({
                        address,
                        status: "invalid",
                        message: parsed.error ?? "Invalid address",
                    });
                    anyInvalid = true;
                    continue;
                }
                if (parsed.kind === "enterprise") {
                    rows.push({
                        address,
                        status: "invalid",
                        message:
                            "Enterprise addresses can't stake — use a base or reward address",
                    });
                    anyInvalid = true;
                    continue;
                }
                if (!isHosky) {
                    rows.push({ address, status: "valid" });
                    continue;
                }
                // Hosky mode: also verify delegation against BE.
                try {
                    const resp = await fetch(
                        ADAMATIC_HOST +
                            `/hosky/${address}/is_delegated_to_hosky`,
                    );
                    if (!resp.ok) throw new Error("be error");
                    const isDelegated = (await resp.json()) as boolean;
                    if (isDelegated) {
                        rows.push({ address, status: "valid" });
                    } else {
                        rows.push({
                            address,
                            status: "not-delegated",
                            message: "Address not delegated to any Hosky Pool",
                        });
                        anyNotDelegated = true;
                    }
                } catch {
                    rows.push({
                        address,
                        status: "not-delegated",
                        message: "Couldn't verify delegation (backend down?)",
                    });
                    anyNotDelegated = true;
                }
            }
            if (cancelled) return;
            setWalletRows(rows);
            setIsDelegatedToHosky(
                !anyInvalid &&
                    !anyNotDelegated &&
                    walletFromList.length > 0 &&
                    walletFromList.some((a) => a.trim() !== ""),
            );
        })();
        return () => {
            cancelled = true;
        };
    }, [walletFromList, isHosky]);

    // ------------- owner pkh derivation -------------
    const ownerPaymentPubKeyHash = useMemo(() => {
        if (walletFromList.length === 0) return "";
        const chain = getChainAdapter();
        const first = walletFromList[0];
        if (!first) return "";
        const parsed = chain.parseAddress(first);
        return parsed.isValid ? parsed.paymentCredentialHash : "";
    }, [walletFromList]);

    // ------------- derived datum + receipt -------------
    const datumDTO: RecurringPaymentDatum = useMemo(
        () => ({
            ownerPaymentPubKeyHash,
            amountToSend,
            payee,
            startTime: startTime ? startTime.valueOf() : 0,
            endTime: lockEndTime ? endTime?.valueOf() : undefined,
            paymentIntervalHours,
            maxPaymentDelayHours: undefined,
            maxFeesLovelace,
        }),
        [
            ownerPaymentPubKeyHash,
            amountToSend,
            payee,
            startTime,
            endTime,
            lockEndTime,
            paymentIntervalHours,
            maxFeesLovelace,
        ],
    );

    const amountPerPayment = amountToSend[0]?.amount ?? 0;
    const numPayments = deposit > 0
        ? Math.floor(deposit / (amountPerPayment + maxFeesLovelace || 1))
        : 0;

    const blockReason: string | null = useMemo(() => {
        if (!connected) return "Connect a wallet to continue";
        if (!ownerPaymentPubKeyHash) return "Invalid owner address";
        if (walletFromList.some((a) => !a || !a.trim()))
            return "Fill in every source wallet";
        if (walletRows.some((r) => r.status !== "valid"))
            return "One or more source wallets are invalid";
        if (!payee) return "Missing payee address";
        if (amountToSend.length === 0 || !amountToSend[0]) return "Missing amount";
        if (!startTime) return "Missing start time";
        if (maxFeesLovelace <= 0) return "Max fee must be > 0";
        if (isHosky && !isDelegatedToHosky)
            return "One or more wallets aren't delegated to a Hosky pool";
        if (!acceptRisk) return "Accept the risk disclosure";
        if (!acceptFees) return "Authorise the fee ceiling";
        return null;
    }, [
        connected,
        ownerPaymentPubKeyHash,
        walletFromList,
        walletRows,
        payee,
        amountToSend,
        startTime,
        maxFeesLovelace,
        isHosky,
        isDelegatedToHosky,
        acceptRisk,
        acceptFees,
    ]);

    const isSubmittable = blockReason === null;

    // ------------- submit -------------
    const submit = useCallback(async () => {
        if (!isSubmittable || !wallet) return;
        if (!automaticPayments?.finalHash) {
            toast.error("Script manifest not loaded yet — retry in a second");
            return;
        }
        setSubmitting(true);
        try {
            const chain = getChainAdapter();

            // Balance pre-check (matches the pre-refactor UX).
            const balance = await wallet.getBalance();
            const collateralUtxos = await wallet.getCollateral();
            const collateralSum = collateralUtxos
                .map(
                    (u: any) =>
                        u.output.amount.filter(
                            (a: any) => a.unit === "lovelace",
                        )[0]?.quantity ?? "0",
                )
                .reduce((a: number, b: string) => a + parseInt(b, 10), 0);
            const adaBalance =
                parseInt(
                    balance.filter((a: any) => a.unit === "lovelace")[0]
                        ?.quantity ?? "0",
                    10,
                ) + collateralSum;
            const minAda = deposit * walletFromList.length + 10_000_000;
            if (adaBalance < minAda) {
                const msg = `Insufficient balance — need at least ${minAda / LOVELACE_PER_ADA} ADA`;
                toast.error(msg, { duration: 5000 });
                setSubmitting(false);
                return;
            }

            const datum = chain.encodeSetupDatum(datumDTO);
            const hash = await chain.buildAndSubmitSetupTx({
                wallet,
                walletApi: walletApi ?? undefined,
                walletFromList,
                depositLovelace: deposit,
                datum,
                scriptHash: automaticPayments.finalHash,
            });
            setTxHash(hash);
            toast.success(
                `Transaction submitted: ${hash.slice(0, 10)}…${hash.slice(-10)}`,
                { duration: 5000 },
            );
        } catch (e: any) {
            toast.error(e?.message ?? String(e), { duration: 5000 });
        } finally {
            setSubmitting(false);
        }
    }, [
        isSubmittable,
        wallet,
        walletApi,
        walletFromList,
        deposit,
        datumDTO,
        automaticPayments,
    ]);

    return {
        state: {
            mode,
            walletFromList,
            walletRows,
            isDelegatedToHosky,
            payee,
            amountToSend,
            maxFeesLovelace,
            startTime,
            endTime,
            paymentIntervalHours,
            paymentIntervalEpochs,
            lockEndTime,
            epochStart,
            epochEnd,
            numPulls,
            deposit,
            acceptRisk,
            acceptFees,
            settings,
        },
        derived: {
            datumDTO,
            amountPerPayment,
            numPayments,
            isSubmittable,
            blockReason,
        },
        submitting,
        txHash,
        addWallet,
        removeWallet,
        updateWallet,
        setPayee,
        setAmountToSend,
        setStartTime,
        setEndTime,
        setMaxFeesLovelace: setMaxFeesWithRecompute,
        setNumPulls: setNumPullsWithRecompute,
        setPaymentIntervalEpochs: setPaymentIntervalEpochsWithRecompute,
        setAcceptRisk,
        setAcceptFees,
        submit,
    };
}
