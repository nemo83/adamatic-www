import {
    Alert,
    Box,
    Button,
    Grid2,
    IconButton,
    Stack,
    Tooltip,
    Typography
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

export default function SetupRecurringPayment(props: {
    isValidNetwork: boolean,
    hoskyInput: boolean,
}) {

    const isDebugMode = false;

    const { setIsOpen } = useTour();

    const [showInfo, setShowInfo] = useState(false);
    const [showLimit, setShowLimit] = useState(false);

    const [version, setVersion] = useState(0);

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
    const [datum, setDatum] = useState<Data>();


    useEffect(() => {
        if (connected) {
            TransactionUtil.createDatum(
                datumDTO
            ).then((datum) => {
                setDatum(datum);
            });
        } else {
            setDatum(undefined);
        }

    }, [datumDTO, connected]);

    useEffect(() => {
        fetch(ADAMATIC_HOST + '/recurring_payments')
            .then(response => response.json())
            .then((data: []) => {
                if (data.length >= 0 && data.length < 10) {
                    setShowInfo(true);
                } else {
                    setShowLimit(true)
                }
            })
            .catch(error => {
                console.error('Error:', error);
                setShowLimit(true)
            })
    }, []);

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
                setTxHash(await wallet.submitTx(signedTx));
                toast.success("Transaction submitted: " + txHash.substring(0, 10) + "..." + txHash.substring(txHash.length - 10), { duration: 5000 });
            } catch (error) {
                toast.error('' + error, { duration: 5000 });
            }
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

                <Box width={"600px"} maxWidth={"60%"}
                    sx={{
                        marginTop: "10rem"
                    }}
                >

                    <Alert hidden={!showInfo} severity="info" sx={{ my: 2 }}>Welcome to Adamatic BETA.</Alert>

                    <Alert hidden={!showLimit} severity="warning" sx={{ my: 2 }}>Adamatic is running in BETA mode. Limit of payments reached.</Alert>


                    <Typography variant="h4">Setup New Hosky Auto-pull</Typography>

                    <UserInput
                        deposit={deposit}
                        setDeposit={setDeposit}
                        walletFrom={walletFrom}
                        setWalletFrom={setWalletFrom}
                        datumDTO={datumDTO}
                        setDatumDTO={setDatumDTO}
                        isHoskyInput={hoskyInput}
                    />


                </Box>
                <Grid2 container width={"60%"} spacing={2} justifyContent={"space-evenly"} >
                    <Grid2 >
                        <Button variant="outlined" onClick={() => setIsOpen(true)}>Take a tour</Button>
                    </Grid2>
                    <Grid2>
                        <Button disabled={!isValidNetwork || showLimit} variant="contained" startIcon={<Send />} onClick={() => signAndSubmit()}>Sign & Submit</Button>
                    </Grid2>
                </Grid2>
                {connected ?
                    <Stack width={"600px"} maxWidth={"60%"}>

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
            </Stack>

        </Box>
    );
}