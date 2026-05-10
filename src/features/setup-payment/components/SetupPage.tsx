import {
    Alert,
    Box,
    Button,
    Grid2,
    Stack,
    Typography,
    Link
} from "@mui/material";
import { Send } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useWallet } from "../../../lib/wallet/useWallet";
import type { RecurringPaymentDatum } from "../../../types/RecurringPaymentDatum";
import type { EncodedDatum } from "../../../lib/cardano/ChainAdapter";
import { getChainAdapter } from "../../../lib/cardano/factory";
import { useScriptByName } from "../../../lib/cardano/ScriptContext";
import { fetchSettings } from "../../../lib/api/adamatic";
import { HOSKY_TOUR_DISPLAYED } from "../../../lib/cardano/constants";
import type { PaymentMode } from "../mode";
import PaymentForm from "./PaymentForm";
import PaymentReceipt from "./PaymentReceipt";
import SubmitPanel from "./SubmitPanel";
import LimitsStrip from "./LimitsStrip";
import { useTranslations } from "../../../lib/i18n/I18nProvider";
import { formatWalletError } from "../../../lib/wallet/errors";
import { getWalletAdaBalance } from "../../../lib/wallet/balance";
import { useTour } from '@reactour/tour'
import toast from "react-hot-toast";
import type { Settings } from "../../../types/AdaMaticTypes";
import NextLink from "next/link";
import {
    Card,
    CardContent,
    Chip,
    Container,
    Divider
} from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import SavingsIcon from '@mui/icons-material/Savings';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import Hero from "../../../../components/Hero";

export default function SetupPage(props: {
    isValidNetwork: boolean,
    mode: PaymentMode,
}) {

    const isDebugMode = false;

    const { setIsOpen } = useTour();

    const [showLimit, setShowLimit] = useState(false);

    const [maintenanceMode, setMaintenanceMode] = useState(false);

    const [settings, setSettings] = useState<Settings | undefined>(undefined)

    useEffect(() => {
        const hoskyTourDisplayed = localStorage.getItem(HOSKY_TOUR_DISPLAYED);
        if (!hoskyTourDisplayed) {
            setIsOpen(true);
            localStorage.setItem(HOSKY_TOUR_DISPLAYED, "true");
        }
        // Mount-only tour init.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { isValidNetwork, mode } = props;
    const { wallet, connected } = useWallet();
    const t = useTranslations();

    const [txHash, setTxHash] = useState<string>("");
    const [datumDTO, setDatumDTO] = useState<RecurringPaymentDatum>({ ownerPaymentPubKeyHash: "", "amountToSend": [], "payee": "", "startTime": 0, "endTime": undefined, "paymentIntervalHours": 0, "maxPaymentDelayHours": undefined, "maxFeesLovelace": 0 });

    const [deposit, setDeposit] = useState<number>(0);
    const [walletFromList, setWalletFromList] = useState<string[]>([]);
    const [acceptRisk, setAcceptRisk] = useState<boolean>(false);
    const [acceptFees, setAcceptFees] = useState<boolean>(false);
    const [datum, setDatum] = useState<EncodedDatum>();

    const chainAdapter = getChainAdapter();
    const automaticPayments = useScriptByName("automatic_payments");

    const [isDelegatedToHosky, setIsDelegatedToHosky] = React.useState<boolean>(true);


    // Receipt section
    const [payeeAddress, setPayeeAddress] = useState<string>("")
    const [amountPerPayment, setAmountPerPayment] = useState<number>(0)
    const [numPayments, setNumPayments] = useState<number>(0)

    useEffect(() => {
        // Skip datum-build until the form has the bits the encoder needs.
        // Without this gate the encoder throws on every keystroke during
        // initial render, spamming "Missing ownerPaymentPubKeyHash or payee"
        // into the console.
        if (
            !connected ||
            !datumDTO.ownerPaymentPubKeyHash ||
            !datumDTO.payee ||
            datumDTO.amountToSend.length === 0
        ) {
            setDatum(undefined);
            return;
        }
        try {
            const datum = chainAdapter.encodeSetupDatum(datumDTO);
            setDatum(datum);
            setPayeeAddress(datumDTO.payee);
            const amountPerPayment = datumDTO.amountToSend[0].amount;
            setAmountPerPayment(amountPerPayment);
            const numPayments = deposit / (amountPerPayment + datumDTO.maxFeesLovelace);
            setNumPayments(numPayments);
        } catch (error) {
            console.warn("could not build datum:", error);
            setDatum(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [datumDTO, connected]);

    // useEffect(() => {
    //     fetch(ADAMATIC_HOST + '/recurring_payments')
    //         .then(response => response.json())
    //         .then((data: []) => {
    //             if (data.length >= 150) {
    //                 setShowLimit(true)
    //             }
    //         })
    //         .catch(error => {
    //             console.error('Error:', error);
    //             setShowLimit(true)
    //         })
    // }, []);

    useEffect(() => {
        fetchSettings().then((data) => {
            if (data) setSettings(data);
        });
    }, [])

    // Wallet ADA balance — used for the pre-submit insufficient-funds check.
    // null while disconnected or fetch failed; we treat null as "skip the check"
    // (the wallet would still refuse to sign if the build runs short).
    const [walletAdaBalance, setWalletAdaBalance] = useState<bigint | null>(null);
    useEffect(() => {
        if (!wallet || !connected) {
            setWalletAdaBalance(null);
            return;
        }
        let cancelled = false;
        getWalletAdaBalance(wallet)
            .then((b) => { if (!cancelled) setWalletAdaBalance(b); })
            .catch(() => { if (!cancelled) setWalletAdaBalance(null); });
        return () => { cancelled = true; };
    }, [wallet, connected]);

    // 2 ADA buffer covers tx fee + min-UTxO for any change output.
    const TX_FEE_BUFFER_LOVELACE = 2_000_000n;
    const requiredLovelace =
        BigInt(deposit) * BigInt(Math.max(walletFromList.length, 1)) + TX_FEE_BUFFER_LOVELACE;
    const insufficientFunds =
        walletAdaBalance !== null &&
        deposit > 0 &&
        walletFromList.some((a) => a.trim().length > 0) &&
        walletAdaBalance < requiredLovelace;
    const shortfallAda = insufficientFunds && walletAdaBalance !== null
        ? ((Number(requiredLovelace - walletAdaBalance)) / 1_000_000).toFixed(2)
        : "0";

    const signAndSubmit = async () => {
        if (!automaticPayments?.finalHash) {
            toast.error(t("tx.scriptsNotLoaded"), { duration: 5000 });
            return;
        }
        if (wallet && datum) {
            try {
                const txHash = await chainAdapter.buildAndSubmitSetupTx({
                    wallet,
                    walletFromList,
                    depositLovelace: deposit,
                    datum,
                    scriptHash: automaticPayments.finalHash,
                });
                setTxHash(txHash);
                toast.success(
                    t("tx.submitted", { hash: txHash.substring(0, 10) + "…" + txHash.substring(txHash.length - 10) }),
                    { duration: 5000 },
                );
            } catch (error) {
                toast.error(formatWalletError(error, t), { duration: 5000 });
            }
        } else {
            toast.error(t("tx.buildFailed"), { duration: 5000 });
        }
    }

    return (
        <Box
            id="hero"
            sx={(theme) => ({
                width: '100%',
                backgroundRepeat: 'no-repeat',

                backgroundImage:
                    'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 70%), transparent)',
                ...theme.applyStyles('dark', {
                    backgroundImage:
                        'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)',
                }),
            })}
        >

            <Stack spacing={4} sx={{
                alignItems: "center",
                pt: { xs: 4, sm: 7 },
            }} >

                <Box width={"750px"} maxWidth={"60%"}
                    sx={{
                        marginTop: "6rem"
                    }}
                >

                    {showLimit && <Alert severity="warning" sx={{ my: 2 }}>{t("setup.limitReached")}</Alert>}

                    {maintenanceMode && <Alert severity="warning" sx={{ my: 2 }}>{t("setup.maintenance")}</Alert>}

                    {/* <Hero/>

                    <Divider sx={{ my: 4 }}>
                        <Chip label="Setup Your Payment" color="primary" />
                    </Divider> */}

                    <LimitsStrip
                        protocolFeeAda={
                            settings
                                ? settings.operator_fee_lovelace / 1_000_000
                                : null
                        }
                    />

                    <PaymentForm
                        deposit={deposit}
                        setDeposit={setDeposit}
                        walletFromList={walletFromList}
                        setWalletFromList={setWalletFromList}
                        acceptRisk={acceptRisk}
                        setAcceptRisk={setAcceptRisk}
                        acceptFees={acceptFees}
                        setAcceptFees={setAcceptFees}
                        datumDTO={datumDTO}
                        setDatumDTO={setDatumDTO}
                        isDelegatedToHosky={isDelegatedToHosky}
                        setIsDelegatedToHosky={setIsDelegatedToHosky}
                        mode={mode}
                    />

                    {/* Payment Receipt Section */}
                    {settings && datumDTO.payee && datumDTO.amountToSend.length > 0 && connected && (
                        <PaymentReceipt
                            payeeAddress={payeeAddress}
                            amountPerPayment={amountPerPayment}
                            numPayments={numPayments}
                            maxFeesLovelace={datumDTO.maxFeesLovelace}
                            walletAddresses={walletFromList}
                        />
                    )}

                    {/* Confirmation Section */}
                    {connected && (
                        <SubmitPanel
                            acceptRisk={acceptRisk}
                            setAcceptRisk={setAcceptRisk}
                            acceptFees={acceptFees}
                            setAcceptFees={setAcceptFees}
                        />
                    )}

                    {connected && insufficientFunds && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            {t("submit.insufficientFunds", { ada: shortfallAda })}
                        </Alert>
                    )}


                </Box>
                <Grid2 container width={"60%"} spacing={2} justifyContent={"space-evenly"} >
                    <Grid2 >
                        <Button
                            variant="outlined"
                            onClick={() => setIsOpen(true)}
                            sx={{
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                px: 4,
                                py: 1.5,
                                borderWidth: '2px',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    borderWidth: '2px',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px 0 rgba(33, 150, 243, 0.2)',
                                }
                            }}
                        >
                            {t("setup.takeTour")}
                        </Button>
                    </Grid2>
                    <Grid2>
                        <Button
                            disabled={!isValidNetwork || showLimit || !acceptRisk || !acceptFees || !isDelegatedToHosky || maintenanceMode || insufficientFunds}
                            variant="contained"
                            startIcon={<Send />}
                            onClick={() => signAndSubmit()}
                            sx={{
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                px: 4,
                                py: 1.5,
                                boxShadow: '0 4px 15px 0 rgba(33, 150, 243, 0.3)',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1976d2 30%, #1976d2 90%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px 0 rgba(33, 150, 243, 0.4)',
                                },
                                '&:disabled': {
                                    background: 'rgba(0, 0, 0, 0.12)',
                                    transform: 'none',
                                    boxShadow: 'none'
                                }
                            }}
                        >
                            {t("setup.create")}
                        </Button>
                    </Grid2>
                </Grid2>
                {connected ?
                    <NextLink href="/payments" passHref legacyBehavior>
                        <Button
                            component="a"
                            variant="text"
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                color: 'primary.main',
                                '&, &:link, &:visited, &:hover, &:active': { color: 'primary.main' },
                            }}
                        >
                            {t("setup.viewMyAutoPulls")} →
                        </Button>
                    </NextLink>
                    : null}

            </Stack>

        </Box>
    );
}