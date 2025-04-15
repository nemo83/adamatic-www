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
import { ADAMATIC_HOST, HOSKY_TOUR_DISPLAYED, SCRIPT } from "../lib/util/Constants";
import PaymentsTable from "./PaymentsTable";
import UserInput from "./UserInput";
import { useTour } from '@reactour/tour'
import CachedIcon from '@mui/icons-material/Cached';
import toast from "react-hot-toast";
import HoskyFAQ from "./HoskyFAQ";
import { Settings } from "../lib/interfaces/AdaMaticTypes";

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

    useEffect(() => {
        if (connected) {
            try {
                const datum = TransactionUtil.createDatum(datumDTO);
                setDatum(datum);
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
                if (data.length >= 100) {
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

                    <Alert severity="info" sx={{ my: 2 }}>EASY1 Stake Pool is now a Rugpool! Thank you for your support!</Alert>

                    <Alert severity="info" sx={{ my: 2 }}>As some users have reported some issues, as a precaution, we&apos;ve reduced the maximum number of pulls to 10</Alert>

                    <Alert hidden={!showLimit} severity="warning" sx={{ my: 2 }}>Limit of payments reached. Please try again later</Alert>

                    <Alert hidden={!maintenanceMode} severity="warning" sx={{ my: 2 }}>AdaMatic is currently in maintenance mode. Please try again later!</Alert>

                    <Typography variant="h4" marginTop={2}>Setup New Hosky Auto-pull</Typography>

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


                </Box>
                <Grid2 container width={"60%"} spacing={2} justifyContent={"space-evenly"} >
                    <Grid2 >
                        <Button variant="outlined" onClick={() => setIsOpen(true)}>Take a tour</Button>
                    </Grid2>
                    <Grid2>
                        <Button disabled={!isValidNetwork || showLimit || !acceptRisk || !acceptFees || !isDelegatedToHosky || maintenanceMode}
                            variant="contained"
                            startIcon={<Send />}
                            onClick={() => signAndSubmit()}>
                            Sign & Submit
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
                                <Tooltip title="Reload auto-pulls">
                                    <IconButton
                                        color="primary"
                                        size="large"
                                        aria-label="reload auto pulls"
                                        onClick={() => setVersion(version + 1)}>
                                        <CachedIcon />
                                    </IconButton>
                                </Tooltip>
                            </Grid2>

                        </Grid2>

                        <PaymentsTable version={version} />


                    </Stack>
                    : null}
                <Typography variant="h4" marginTop={2}>F.A.Q.</Typography>
                <Box width={"750px"} maxWidth={"60%"}>
                    <HoskyFAQ />
                </Box>

            </Stack>

        </Box>
    );
}