import type { RecurringPaymentDatum } from "../../../types/RecurringPaymentDatum";
import {
    Avatar,
    Button, Checkbox, Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, FormControlLabel, FormGroup, InputAdornment,
    Stack,
    TextField, Tooltip, Box, IconButton, Divider, Typography
} from "@mui/material";
import React, { useEffect } from "react";
import { Add, Delete } from "@mui/icons-material";
import type { AssetAmount } from "../../../types/AssetAmount";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { CONSTANTS } from "../../../lib/cardano/constants";
import { useWallet } from "../../../lib/wallet/useWallet";
import { getChainAdapter } from "../../../lib/cardano/factory";
import {
    fetchHoskyTemplate,
    fetchIsDelegatedToHosky,
} from "../../../lib/api/adamatic";
import type { HoskyTemplate } from "../../../types/AdaMaticTypes";
import type { PaymentMode } from "../mode";
import HoskyDelegationModal from "../../delegation/components/HoskyDelegationModal";
import { useHoskyPools } from "../../delegation/hooks/useHoskyPools";
import { trackDelegationFlow } from "../../delegation/hooks/useDelegationTracking";
import toast from "react-hot-toast";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { useTranslations } from "../../../lib/i18n/I18nProvider";
import { isUserDeclinedError } from "../../../lib/wallet/errors";

export default function PaymentForm(props: {
    deposit: number,
    setDeposit: (deposit: number) => void,
    walletFromList: string[],
    setWalletFromList: (walletFromList: string[]) => void,
    acceptRisk: boolean,
    setAcceptRisk: (acceptRisk: boolean) => void,
    acceptFees: boolean,
    setAcceptFees: (acceptFees: boolean) => void,
    datumDTO: RecurringPaymentDatum,
    setDatumDTO: (userInput: RecurringPaymentDatum) => void,
    isDelegatedToHosky: boolean,
    setIsDelegatedToHosky: (isDelegatedHosky: boolean) => void,
    mode: PaymentMode
}) {

    const { deposit, setDeposit, walletFromList, setWalletFromList, acceptRisk, setAcceptRisk, acceptFees, setAcceptFees, datumDTO, setDatumDTO, isDelegatedToHosky, setIsDelegatedToHosky, mode } = props;
    const isHoskyInput = mode === "hosky";
    const t = useTranslations();

    const [dialogOpen, setDialogOpen] = React.useState(false);

    const { wallet, connected, address: walletAddress } = useWallet();

    const [delegationModalOpen, setDelegationModalOpen] = React.useState(false);
    /** Address the user clicked "Delegate" on but doesn't match the connected wallet. */
    const [mismatchAddress, setMismatchAddress] = React.useState<string | null>(null);
    /** Bumped after a successful delegation polling cycle to force the
     *  delegation-check effect to re-run against the BE. */
    const [delegationCheckVersion, setDelegationCheckVersion] = React.useState(0);
    const { pools: hoskyPools, loading: poolsLoading } = useHoskyPools();

    /** Adapter is fetched fresh; it's a singleton so this is a no-op. */
    const stakeHashOf = React.useCallback(
        (addr: string | null | undefined) => {
            if (!addr) return null;
            const parsed = getChainAdapter().parseAddress(addr);
            return parsed.isValid ? parsed.stakeCredentialHash ?? null : null;
        },
        [],
    );

    /** Per-row "Delegate this wallet" click handler. Either opens the modal
     *  (connected wallet owns the address) or surfaces a switch-wallet dialog. */
    const handleRowDelegate = (address: string) => {
        if (!walletAddress) {
            toast.error(t("wallet.connectFirst"));
            return;
        }
        const typedHash = stakeHashOf(address);
        const walletHash = stakeHashOf(walletAddress);
        if (!typedHash || !walletHash) {
            toast.error(t("delegate.couldntReadAddress"));
            return;
        }
        if (typedHash !== walletHash) {
            setMismatchAddress(address);
            return;
        }
        setDelegationModalOpen(true);
    };

    /** Auto-dismiss the mismatch dialog when the user switches to the
     *  matching wallet account in their extension (focus refresh updates
     *  walletAddress). */
    useEffect(() => {
        if (!mismatchAddress || !walletAddress) return;
        if (stakeHashOf(mismatchAddress) === stakeHashOf(walletAddress)) {
            setMismatchAddress(null);
            toast.success(t("delegate.walletSwitched"));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletAddress, mismatchAddress, stakeHashOf]);

    const [owner, setOwner] = React.useState<string>("");
    const [payee, setPayee] = React.useState<string>("");
    const [maxFeesLovelace, setMaxFeesLovelace] = React.useState<number>(1_000_000);
    const [startTime, setStartTime] = React.useState<Dayjs | null>(dayjs());
    const [endTime, setEndTime] = React.useState<Dayjs | null>(null);
    const [paymentIntervalEpochs, setPaymentIntervalEpochs] = React.useState<number>(1);
    const [paymentIntervalHours, setPaymentIntervalHours] = React.useState<number>(1);
    const [inputLovelace, setInputLovelace] = React.useState<boolean>(false)

    const [epochStart, setEpochStart] = React.useState<number>(0);
    const [epochEnd, setEpochEnd] = React.useState<number>(0);

    const [numPulls, setNumPulls] = React.useState<number>(1);

    const [lockEndTime, setLockEndTime] = React.useState<boolean>(false);

    // Track delegation status for each wallet address
    const [delegationStatus, setDelegationStatus] = React.useState<{ [address: string]: boolean }>({});

    // Track validation status for each wallet address
    const [validationStatus, setValidationStatus] = React.useState<{ [address: string]: { isValid: boolean, error: string } }>({});

    const chainAdapter = getChainAdapter();

    // Validate Cardano address format via the chain adapter (Mesh in Phase B,
    // Evolution in Phase C). UI accepts base + reward addresses for staking.
    const validateCardanoAddress = (address: string): { isValid: boolean, error: string } => {
        if (!address || address.trim() === "") {
            return { isValid: false, error: "" };
        }
        const parsed = chainAdapter.parseAddress(address.trim());
        if (!parsed.isValid) {
            return { isValid: false, error: t("form.addressInvalid") };
        }
        if (parsed.kind === "enterprise") {
            return { isValid: false, error: t("form.addressUnsupported") };
        }
        return { isValid: true, error: "" };
    };

    // Initialize with at least one empty address field
    useEffect(() => {
        if (walletFromList.length === 0) {
            setWalletFromList([""]);
        }
        // Mount-only seed; the length-guard makes re-runs idempotent anyway.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Check validation and delegation status for all wallet addresses
        const checkDelegationForAllAddresses = async () => {
            const newDelegationStatus: { [address: string]: boolean } = {};
            const newValidationStatus: { [address: string]: { isValid: boolean, error: string } } = {};
            let allDelegated = true;
            let allValid = true;

            for (const address of walletFromList) {
                // First validate the address format
                const validation = validateCardanoAddress(address);
                newValidationStatus[address] = validation;

                if (!validation.isValid && address !== "") {
                    allValid = false;
                    allDelegated = false;
                    newDelegationStatus[address] = false;
                    continue;
                } else if (address.trim() === "") {
                    allValid = false;
                }

                // Only check delegation if address is valid and not empty
                if (address && validation.isValid) {
                    const isDelegated = await fetchIsDelegatedToHosky(address);
                    newDelegationStatus[address] = isDelegated;
                    if (!isDelegated) {
                        allDelegated = false;
                    }
                } else {
                    newDelegationStatus[address] = false;
                    if (address !== "") {
                        allDelegated = false;
                    }
                }
            }

            setValidationStatus(newValidationStatus);
            setDelegationStatus(newDelegationStatus);
            setIsDelegatedToHosky(allDelegated && allValid && walletFromList.length > 0 && walletFromList.some(addr => addr !== ""));
        };

        if (walletFromList.length > 0) {
            checkDelegationForAllAddresses();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletFromList, setIsDelegatedToHosky, delegationCheckVersion])

    useEffect(() => {
        if (connected && walletAddress) {
            setOwner(walletAddress);
            if (walletFromList.length > 0 && walletFromList[0] === "") {
                const newWalletFromList = [walletAddress, ...walletFromList.slice(1)];
                setWalletFromList(newWalletFromList);
            }
        }
        // Seed the first slot only when the wallet identity changes; including
        // walletFromList would clobber later manual edits.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connected, walletAddress])

    useEffect(() => {
        if (isHoskyInput) {
            fetchHoskyTemplate().then((data) => {
                if (data) updateForm(data);
            });
        }
        // updateForm closes over component scope and isn't memoized; including
        // it would refetch the template every render. One fetch on hosky-mode
        // entry is the intent.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isHoskyInput]);

    const updateStuff = async (maxFees: number, epochStart: number, numPulls: number, epochFrequency: number) => {

        if (maxFees == null || isNaN(maxFees)
            || epochStart == null || isNaN(epochStart)
            || numPulls == null || isNaN(numPulls)
            || epochFrequency == null || isNaN(epochFrequency)) {
            return;
        }

        const baseRequest = {
            max_fees: maxFees.toString(),
            epoch_start: epochStart.toString(),
            num_pulls: numPulls.toString(),
            epoch_frequency: epochFrequency.toString()
        };

        if (isHoskyInput) {
            fetchHoskyTemplate(baseRequest).then((data) => {
                if (data) updateForm(data);
            });
        }
    }

    const updateForm = (data: HoskyTemplate) => {
        setEpochStart(data.epoch_start);
        setEpochEnd(data.epoch_end);

        const numPulls = Math.floor((data.epoch_end - data.epoch_start) / data.epoch_frequency);
        setNumPulls(numPulls)

        setDeposit(data.suggested_deposit[0].amount);
        setPayee(data.payee_address);
        setStartTime(dayjs(data.start_time_timestamp));
        setEndTime(dayjs(data.end_time_timestamp));

        setPaymentIntervalHours(data.payment_interval_hours);
        setPaymentIntervalEpochs(data.epoch_frequency);

        setMaxFeesLovelace(data.max_fee_lovelaces);
        setLockEndTime(data.lock_end_time);
    }

    useEffect(() => {

        const ownerPkh = owner ? chainAdapter.parseAddress(owner).paymentCredentialHash : "";
        const newDatumDTO = {
            ...datumDTO,
            ownerPaymentPubKeyHash: ownerPkh,
            amountToSend: [{ policyId: "", assetName: "", amount: 2000000 }],
            payee,
            startTime: startTime!.valueOf(),
            endTime: lockEndTime ? endTime?.valueOf() : undefined,
            paymentIntervalHours: paymentIntervalHours,
            maxFeesLovelace: maxFeesLovelace,
        }
        setDatumDTO(newDatumDTO);

        // datumDTO itself is the state we're rebuilding — including it would
        // infinite-loop. chainAdapter is a stable singleton from
        // getChainAdapter(); setDatumDTO is a setter.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [owner, payee, startTime, endTime, lockEndTime, paymentIntervalHours, maxFeesLovelace])

    const addWalletAddress = () => {
        setWalletFromList([...walletFromList, ""]);
    };

    const removeWalletAddress = (index: number) => {
        if (walletFromList.length > 1) {
            const newList = walletFromList.filter((_, i) => i !== index);
            setWalletFromList(newList);
        }
    };

    const updateWalletAddress = (index: number, newAddress: string) => {
        const currentList = walletFromList.length > 0 ? walletFromList : [""];
        const newList = [...currentList];

        // if (index == 0) {
            // newList[index] = newAddress || (owner || "");
        // } else {
            newList[index] = newAddress || "";
        // }

        setWalletFromList(newList);
    };

    return (
        <Stack spacing={1} style={{ paddingTop: "10px" }}>
            {/* Multiple Wallet Addresses Section */}
            <Box data-tut="step-1">
                <Tooltip title={t("form.addressesTooltip")}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t("form.addressesLabel")}
                    </Typography>
                </Tooltip>

                {/* Render at least one address field, even if walletFromList is empty */}
                {(walletFromList.length > 0 ? walletFromList : [""]).map((address, index) => {
                    const validation = validationStatus[address];
                    const isDelegated = delegationStatus[address];

                    // Determine error state and message
                    let hasError = false;
                    let errorMessage = "";

                    if (address !== "") {
                        if (validation && !validation.isValid) {
                            hasError = true;
                            errorMessage = validation.error;
                        } else if (validation && validation.isValid && !isDelegated) {
                            hasError = true;
                            errorMessage = t("form.addressNotDelegated");
                        }
                    }

                    const showDelegateCta =
                        isHoskyInput &&
                        hasError &&
                        validation?.isValid &&
                        !isDelegated;

                    return (
                        <Box key={index} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <TextField
                                    required={true}
                                    fullWidth
                                    label={t("form.addressLabel", { n: index + 1 })}
                                    value={address}
                                    name={`addressFrom-${index}`}
                                    onChange={(e) => updateWalletAddress(index, e.target.value)}
                                    error={hasError}
                                    // Suppress the helper text when the per-row CTA is showing —
                                    // the CTA carries the message + the action.
                                    helperText={
                                        showDelegateCta
                                            ? null
                                            : hasError
                                                ? errorMessage
                                                : null
                                    }
                                    data-tut={index === 0 ? "step-1" : undefined}
                                    sx={{ flex: 1 }}
                                />
                                {walletFromList.length > 1 && (
                                    <Tooltip title={t("form.removeAddress")}>
                                        <IconButton
                                            onClick={() => removeWalletAddress(index)}
                                            size="small"
                                            sx={{
                                                mt: 1,
                                                color: 'error.main',
                                                '&:hover': { backgroundColor: 'error.light', color: 'white' }
                                            }}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                            {showDelegateCta && (
                                <Box
                                    data-tut={index === 0 ? "step-delegate" : undefined}
                                    sx={{
                                        mt: 1,
                                        px: 1.5,
                                        py: 1,
                                        borderRadius: 1.5,
                                        border: '1px solid #FDE68A',
                                        bgcolor: '#FFFBEB',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 1,
                                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                                        <LocalFireDepartmentIcon sx={{ color: '#B45309', fontSize: 20 }} />
                                        <Typography variant="caption" sx={{ color: '#78350F', fontWeight: 500, lineHeight: 1.4 }}>
                                            {t("form.rowDelegateMessage")}
                                        </Typography>
                                    </Stack>
                                    <Button
                                        size="small"
                                        data-tut="step-delegate"
                                        onClick={() => handleRowDelegate(address)}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            color: '#B45309',
                                            whiteSpace: 'nowrap',
                                            '&:hover': { bgcolor: 'rgba(180,83,9,0.08)' },
                                        }}
                                    >
                                        {t("form.rowDelegateCta")}
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    );
                })}

                {/* Add Address Section with Divider */}
                <Box sx={{ mt: 2, mb: 2 }}>
                    <Divider>
                        <Tooltip title={t("form.addAddressTooltip")}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    cursor: 'pointer',
                                    px: 2,
                                    py: 1,
                                    borderRadius: '16px',
                                    transition: 'all 0.2s ease-in-out',
                                    backgroundColor: 'transparent',
                                    '&:hover': {
                                        backgroundColor: 'rgba(33, 150, 243, 0.08)',
                                        transform: 'scale(1.02)',
                                    },
                                }}
                                onClick={addWalletAddress}
                            >
                                <IconButton
                                    size="small"
                                    sx={{
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        width: 24,
                                        height: 24,
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                            transform: 'scale(1.1)'
                                        },
                                    }}
                                >
                                    <Add fontSize="small" />
                                </IconButton>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        fontWeight: 500,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {t("form.addAddress")}
                                </Typography>
                            </Box>
                        </Tooltip>
                    </Divider>
                </Box>

            </Box>

            <Dialog
                open={mismatchAddress !== null}
                onClose={() => setMismatchAddress(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ pb: 0.5 }}>{t("delegate.differentWallet.title")}</DialogTitle>
                <DialogContent>
                    <Stack spacing={1.5} sx={{ pt: 0.5 }}>
                        <DialogContentText sx={{ fontSize: 14 }}>
                            {t("delegate.differentWallet.body")}
                        </DialogContentText>
                        <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'rgba(0,0,0,0.04)' }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25 }}>
                                {t("delegate.differentWallet.addressToDelegate")}
                            </Typography>
                            <Typography sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, wordBreak: 'break-all' }}>
                                {mismatchAddress}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.25, mb: 0.25 }}>
                                {t("delegate.differentWallet.currentlyConnected")}
                            </Typography>
                            <Typography sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, wordBreak: 'break-all' }}>
                                {walletAddress ?? '—'}
                            </Typography>
                        </Box>
                        <DialogContentText
                            sx={{ fontSize: 13.5 }}
                            dangerouslySetInnerHTML={{
                                __html: t("delegate.differentWallet.instructions"),
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setMismatchAddress(null)} variant="contained" sx={{ textTransform: 'none' }}>
                        {t("common.gotIt")}
                    </Button>
                </DialogActions>
            </Dialog>

            <HoskyDelegationModal
                open={delegationModalOpen}
                onClose={() => setDelegationModalOpen(false)}
                pools={poolsLoading || hoskyPools.length === 0 ? undefined : hoskyPools}
                onDelegate={async (poolId) => {
                    if (!connected || !wallet || !walletAddress) {
                        toast.error(t("wallet.connectFirst"));
                        return;
                    }
                    setDelegationModalOpen(false);
                    const FLOW_TOAST = "delegation-flow";
                    toast.loading(t("delegate.building"), { id: FLOW_TOAST });
                    try {
                        const adapter = getChainAdapter();
                        const txHash = await adapter.buildAndSubmitDelegateTx({
                            wallet,
                            poolBech32: poolId,
                        });
                        // Don't await — fire-and-forget polling. The toast
                        // updates as it progresses through phases.
                        trackDelegationFlow({
                            txHash,
                            walletAddress,
                            toastId: FLOW_TOAST,
                            t,
                            onDelegated: () =>
                                setDelegationCheckVersion((v) => v + 1),
                        });
                    } catch (err) {
                        if (isUserDeclinedError(err)) {
                            toast.error(t("tx.userCancelled"), { id: FLOW_TOAST, duration: 5000 });
                        } else {
                            toast.error(t("delegate.failed", { error: String(err) }), {
                                id: FLOW_TOAST,
                                duration: 6000,
                            });
                        }
                    }
                }}
            />

            <Tooltip title={t("form.maxFeesTooltip")}>
                <TextField label={t("form.maxFeesLabel")} type={"number"} value={inputLovelace ? maxFeesLovelace : maxFeesLovelace / CONSTANTS.ADA_CONVERSION} name={"maxFeesLovelace"}
                    slotProps={{
                        input: {
                            endAdornment: <Button onClick={() => setInputLovelace(!inputLovelace)}>{inputLovelace ? t("form.asset.unitToggleLovelace") : t("form.asset.unitToggleAda")}</Button>,
                        },
                        htmlInput: { min: inputLovelace ? 200_000 : 0.2, max: inputLovelace ? 1_500_000 : 1.5, step: inputLovelace ? 100000 : 0.1 }
                    }}
                    data-tut="step-3"
                    onChange={(event) => { updateStuff(inputLovelace ? Number(event.target.value) : Number(event.target.value) * CONSTANTS.ADA_CONVERSION, epochStart, numPulls, paymentIntervalEpochs) }}
                />
            </Tooltip>

            {
                isHoskyInput ?
                    <Tooltip title={t("form.firstEpochTooltip")}>
                        <TextField type={"number"} label={t("form.firstEpochLabel")} value={epochStart} name={"startEpoch"} onChange={(event) => updateStuff(maxFeesLovelace, parseInt(event.target.value), Math.floor((epochEnd - epochStart) / paymentIntervalEpochs), paymentIntervalEpochs)}
                            slotProps={{
                                input: {
                                    endAdornment: <InputAdornment position="end">{startTime!.format('DD.MM.YYYY HH:mm')}</InputAdornment>,
                                },
                            }}
                            data-tut="step-5"
                        />
                    </Tooltip>
                    :
                    <Tooltip title={t("form.startTimeTooltip")}>
                        <DateTimePicker label={t("form.startTimeLabel")} value={startTime} onChange={(newValue) => setStartTime(newValue)} />
                    </Tooltip>
            }


            {
                isHoskyInput ?
                    <Tooltip title={t("form.lastEpochTooltip")}>
                        <TextField disabled={isHoskyInput} type={"number"} label={t("form.lastEpochLabel")} value={epochEnd} name={"endEpoch"}
                            slotProps={{
                                input: {
                                    endAdornment: <InputAdornment position="end">{endTime ? endTime!.format('DD.MM.YYYY HH:mm') : ''}</InputAdornment>,
                                },
                            }}
                            data-tut="step-6"
                        />
                    </Tooltip>
                    :
                    <Tooltip title={t("form.endTimeTooltip")}>
                        <DateTimePicker label={t("form.endTimeLabel")} value={endTime} onChange={(newValue) => setEndTime(newValue)} />
                    </Tooltip>
            }


            <div>
                {isHoskyInput ?

                    <Tooltip title={t("form.numPullsTooltip")}>
                        <TextField style={{ width: "50%" }}
                            label={t("form.numPullsLabel")}
                            type={"number"}
                            slotProps={{
                                htmlInput: { min: 1 }
                            }}
                            value={numPulls}
                            name={"numPulls"}
                            onChange={(event) => { updateStuff(maxFeesLovelace, epochStart, parseInt(event.target.value), paymentIntervalEpochs) }}
                            data-tut="step-7"
                        />
                    </Tooltip>


                    : <Tooltip title={t("form.maxDelayTooltip")} >
                        <TextField style={{ width: "50%" }} label={t("form.maxDelayLabel")} type={"number"} value={datumDTO.maxPaymentDelayHours} name={"maxPaymentDelayHours"} />
                    </Tooltip>
                }

                <Tooltip title={t("form.intervalTooltip")}>
                    <TextField style={{ width: "50%" }} label={t("form.intervalLabel")} type={"number"} value={paymentIntervalEpochs} name={"paymentIntervalHours"}
                        onChange={(event) => { updateStuff(maxFeesLovelace, epochStart, numPulls, parseInt(event.target.value)) }}
                        data-tut="step-8"
                    />
                </Tooltip>
            </div>

            {isHoskyInput ? null :
                <>
                    <Tooltip title={t("form.addAssetTooltip")}>
                        <span> {/*I need to add a span to make the tooltip work eventhough the button is disabled. Mui is listening to events, which aren't triggered on disabled buttons.*/}
                            <Button disabled={isHoskyInput} variant="outlined" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
                                {t("form.addAsset")}
                            </Button>
                        </span>
                    </Tooltip>

                    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}
                        PaperProps={{
                            component: 'form',
                            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                                event.preventDefault();
                                const formData = new FormData(event.currentTarget);
                                const formJson = Object.fromEntries((formData as any).entries());
                                const asset: AssetAmount = {
                                    policyId: formJson.policyId,
                                    assetName: formJson.assetName ? formJson.assetName : "lovelace",
                                    amount: inputLovelace ? Number(formJson.amount) : Number(formJson.amount) * 1000000
                                };
                                const arr = datumDTO.amountToSend;
                                arr.push(asset);
                                setDatumDTO({ ...datumDTO, amountToSend: arr });
                                setDialogOpen(false);
                            },
                        }}>
                        <DialogTitle>{t("form.asset.title")}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {t("form.asset.body")}
                            </DialogContentText>
                            <TextField
                                autoFocus
                                margin={"dense"}
                                id={"policyId"}
                                name={"policyId"}
                                label={t("form.asset.policyId")}
                                type={"text"}
                                fullWidth
                                variant={"standard"}
                            />
                            <TextField
                                margin={"dense"}
                                id={"assetName"}
                                name={"assetName"}
                                label={t("form.asset.assetName")}
                                type={"text"}
                                fullWidth
                                variant={"standard"}
                            />
                            <TextField
                                required
                                margin={"dense"}
                                id={"amount"}
                                name={"amount"}
                                label={t("form.asset.amount")}
                                type={"number"}
                                fullWidth
                                variant={"standard"}
                                slotProps={{
                                    input: {
                                        endAdornment: <Button onClick={() => setInputLovelace(!inputLovelace)}>{inputLovelace ? t("form.asset.unitToggleLovelace") : t("form.asset.unitToggleAda")}</Button>,
                                    },
                                }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
                            <Button type="submit">{t("common.add")}</Button>
                        </DialogActions>
                    </Dialog>
                    <div style={{ minHeight: "100px" }}>
                        {datumDTO.amountToSend.map((asset, index) => (
                            <Chip key={asset.policyId} disabled={isHoskyInput} variant={"outlined"} color={"primary"} style={{ height: "100%", maxWidth: "fit-content" }}
                                avatar={<Avatar src={"/img/cardano-starburst-white.svg"} />}
                                label={(
                                    <section>
                                        <div className={"assetChip"}>{asset.assetName}</div>
                                        <div className={"assetChip"}>{
                                            asset.policyId ?
                                                <>{asset.amount}</> :
                                                inputLovelace ?
                                                    <>{asset.amount} {t("common.lovelace")}</> :
                                                    <>{asset.amount / CONSTANTS.ADA_CONVERSION} {t("common.ada")}</>
                                        }
                                        </div>
                                    </section>
                                )}
                                onDelete={() => {
                                    if (!isHoskyInput) {
                                        const arr = datumDTO.amountToSend;
                                        arr.splice(index, 1);
                                        setDatumDTO({ ...datumDTO, amountToSend: arr });
                                    }
                                }}
                            />
                        ))}
                    </div>
                </>}

        </Stack>

    )
}