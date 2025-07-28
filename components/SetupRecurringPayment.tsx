import {
    Alert,
    Box,
    Button,
    Grid2,
    IconButton,
    Stack,
    Tooltip,
    Typography,
    Link
} from "@mui/material";
import { Send } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useWallet } from "@meshsdk/react";
import RecurringPaymentDatum from "../lib/interfaces/RecurringPaymentDatum";
import { Data, Recipient, Transaction } from "@meshsdk/core";
import TransactionUtil from "../lib/util/TransactionUtil";
import { ADAMATIC_HOST, HOSKY_TOUR_DISPLAYED, SCRIPT, CONSTANTS } from "../lib/util/Constants";
import PaymentsTable from "./PaymentsTable";
import UserInput from "./UserInput";
import PaymentReceipt from "./PaymentReceipt";
import PaymentConfirmation from "./PaymentConfirmation";
import { useTour } from '@reactour/tour'
import CachedIcon from '@mui/icons-material/Cached';
import toast from "react-hot-toast";
import { Settings } from "../lib/interfaces/AdaMaticTypes";
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
import Hero from "./Hero";

export default function SetupRecurringPayment(props: {
    isValidNetwork: boolean,
    hoskyInput: boolean,
}) {

    const isDebugMode = false;

    const { setIsOpen } = useTour();

    const [showLimit, setShowLimit] = useState(false);

    const [maintenanceMode, setMaintenanceMode] = useState(false);

    const [version, setVersion] = useState(0);

    const [settings, setSettings] = useState<Settings | undefined>(undefined)

    useEffect(() => {
        const hoskyTourDisplayed = localStorage.getItem(HOSKY_TOUR_DISPLAYED);
        if (!hoskyTourDisplayed) {
            setIsOpen(true);
            localStorage.setItem(HOSKY_TOUR_DISPLAYED, "true");
        }
    }, []);

    const { isValidNetwork, hoskyInput } = props;
    const { wallet, connected } = useWallet();

    const [txHash, setTxHash] = useState<string>("");
    const [datumDTO, setDatumDTO] = useState<RecurringPaymentDatum>({ ownerPaymentPubKeyHash: "", "amountToSend": [], "payee": "", "startTime": 0, "endTime": undefined, "paymentIntervalHours": 0, "maxPaymentDelayHours": undefined, "maxFeesLovelace": 0 });

    const [deposit, setDeposit] = useState<number>(0);
    const [walletFrom, setWalletFrom] = useState<string>("");
    const [acceptRisk, setAcceptRisk] = useState<boolean>(false);
    const [acceptFees, setAcceptFees] = useState<boolean>(false);
    const [datum, setDatum] = useState<Data>();

    const [isDelegatedToHosky, setIsDelegatedToHosky] = React.useState<boolean>(true);


    // Receipt section
    const [payeeAddress, setPayeeAddress] = useState<string>("")
    const [amountPerPayment, setAmountPerPayment] = useState<number>(0)
    const [numPayments, setNumPayments] = useState<number>(0)

    useEffect(() => {
        if (connected) {
            try {
                const datum = TransactionUtil.createDatum(datumDTO);
                setDatum(datum);

                setPayeeAddress(datumDTO.payee);

                const amountPerPayment = datumDTO.amountToSend[0].amount;
                console.log("amountPerPayment: " + amountPerPayment);

                setAmountPerPayment(amountPerPayment)

                const numPayments = deposit / (amountPerPayment + datumDTO.maxFeesLovelace)
                console.log("numPayments: " + numPayments);

                setNumPayments(numPayments)
            } catch (error) {
                console.warn('could not build datum: ' + error);
                setDatum(undefined);
            }
        } else {
            setDatum(undefined);
        }

    }, [datumDTO, connected]);

    useEffect(() => {
        fetch(ADAMATIC_HOST + '/recurring_payments')
            .then(response => response.json())
            .then((data: []) => {
                if (data.length >= 150) {
                    setShowLimit(true)
                }
            })
            .catch(error => {
                console.error('Error:', error);
                setShowLimit(true)
            })
    }, []);

    useEffect(() => {
        fetch(ADAMATIC_HOST + '/settings')
            .then(response => response.json())
            .then((data: Settings) => {
                console.log('settings: ' + JSON.stringify(data));
                setSettings(data);
            })
    }, [])

    const signAndSubmit = async () => {

        const balance = await wallet.getBalance();
        const collateralUtxos = await wallet.getCollateral();

        const collateralSum = collateralUtxos.map((utxo) => utxo.output.amount.filter((asset) => asset.unit === "lovelace")[0].quantity).reduce((a, b) => a + parseInt(b), 0);

        const adaBalance = parseInt(balance.filter((asset) => asset.unit === "lovelace")[0].quantity) + collateralSum;

        const minAdaBalance = deposit + 10_000_000;
        if (adaBalance < minAdaBalance) {
            toast.error(`Insufficient balance, please ensure the wallet contains at least ${minAdaBalance / 1_000_000} ada`, { duration: 5000 })
            return Promise.reject(`Insufficient balance, please ensure the wallet contains at least ${minAdaBalance / 1_000_000} ada`);
        }

        if (wallet && datum) {
            const scriptAddress = await TransactionUtil.getScriptAddressWithStakeCredential(wallet, SCRIPT, walletFrom);
            const recipient: Recipient = {
                address: scriptAddress,
                datum: {
                    value: datum,
                    inline: true
                }
            };

            try {
                const unsignedTx = await new Transaction({ initiator: wallet }).sendLovelace(recipient, String(deposit)).build();
                const signedTx = await wallet.signTx(unsignedTx);
                const txHash = await wallet.submitTx(signedTx);
                setTxHash(txHash);
                toast.success("Transaction submitted: " + txHash.substring(0, 10) + "..." + txHash.substring(txHash.length - 10), { duration: 5000 });
            } catch (error) {
                toast.error('' + error, { duration: 5000 });
            }
        } else {
            toast.error('It was not possible to build the transaction. Please contact support', { duration: 5000 });
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
            {settings ?
                <Typography paddingRight={3} align="right">
                    Protocol Fee: {settings.operator_fee_lovelace / 1_000_000}
                </Typography>
                : null}

            <Stack spacing={4} sx={{
                alignItems: "center",
                pt: { xs: 4, sm: 7 },
            }} >

                <Box width={"750px"} maxWidth={"60%"}
                    sx={{
                        marginTop: "6rem"
                    }}
                >

                    {/* <Alert severity="info" sx={{ my: 2 }}>EASY1 Stake Pool is now a Rugpool! Thank you for your support!</Alert> */}

                    <Alert hidden={true} severity="info" sx={{ my: 2 }}>As some users have reported some issues, as a precaution, we&apos;ve reduced the maximum number of pulls to 10</Alert>

                    <Alert hidden={!showLimit} severity="warning" sx={{ my: 2 }}>Limit of payments reached. Please try again later</Alert>

                    <Alert hidden={!maintenanceMode} severity="warning" sx={{ my: 2 }}>AdaMatic is currently in maintenance mode. Please try again later!</Alert>

                    {/* <Hero/>

                    <Divider sx={{ my: 4 }}>
                        <Chip label="Setup Your Payment" color="primary" />
                    </Divider> */}

                    <UserInput
                        deposit={deposit}
                        setDeposit={setDeposit}
                        walletFrom={walletFrom}
                        setWalletFrom={setWalletFrom}
                        acceptRisk={acceptRisk}
                        setAcceptRisk={setAcceptRisk}
                        acceptFees={acceptFees}
                        setAcceptFees={setAcceptFees}
                        datumDTO={datumDTO}
                        setDatumDTO={setDatumDTO}
                        isDelegatedToHosky={isDelegatedToHosky}
                        setIsDelegatedToHosky={setIsDelegatedToHosky}
                        isHoskyInput={hoskyInput}
                    />

                    {/* Payment Receipt Section */}
                    {settings && datumDTO.payee && datumDTO.amountToSend.length > 0 && connected && (
                        <PaymentReceipt
                            payeeAddress={payeeAddress}
                            amountPerPayment={amountPerPayment}
                            numPayments={numPayments}
                            maxFeesLovelace={datumDTO.maxFeesLovelace}
                            totalDeposit={deposit}
                        />
                    )}

                    {/* Confirmation Section */}
                    {connected && (
                        <PaymentConfirmation
                            acceptRisk={acceptRisk}
                            setAcceptRisk={setAcceptRisk}
                            acceptFees={acceptFees}
                            setAcceptFees={setAcceptFees}
                        />
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
                            Take a Tour
                        </Button>
                    </Grid2>
                    <Grid2>
                        <Button
                            disabled={!isValidNetwork || showLimit || !acceptRisk || !acceptFees || !isDelegatedToHosky || maintenanceMode}
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
                            Create Recurring Payment
                        </Button>
                    </Grid2>
                </Grid2>
                {connected ?
                    <Stack width={"750px"} maxWidth={"60%"}>

                        <Grid2 container width={"100%"} justifyContent={"space-between"}>
                            <Grid2>
                                <Typography variant="h4">My Auto-pulls</Typography>
                            </Grid2>
                            <Grid2>
                                <Tooltip title="Refresh Payments">
                                    <IconButton
                                        color="primary"
                                        size="large"
                                        aria-label="reload auto pulls"
                                        onClick={() => setVersion(version + 1)}
                                        sx={{
                                            background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.1) 30%, rgba(33, 203, 243, 0.1) 90%)',
                                            borderRadius: '12px',
                                            transition: 'all 0.3s ease-in-out',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.2) 30%, rgba(33, 203, 243, 0.2) 90%)',
                                                transform: 'rotate(180deg) scale(1.1)',
                                            }
                                        }}
                                    >
                                        <CachedIcon />
                                    </IconButton>
                                </Tooltip>
                            </Grid2>

                        </Grid2>

                        <PaymentsTable version={version} />


                    </Stack>
                    : null}

            </Stack>

        </Box>
    );
}