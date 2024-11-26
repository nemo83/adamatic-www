import {
    Alert,
    Box,
    Button,
    Grid,
    Grid2,
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
import { TourProvider, useTour } from '@reactour/tour'

export default function SetupRecurringPayment(props: {
    isValidNetwork: boolean,
    hoskyInput: boolean,
}) {

    const isDebugMode = false;

    const { setIsOpen } = useTour();

    const [showInfo, setShowInfo] = useState(false);
    const [showLimit, setShowLimit] = useState(false);

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

    async function signAndSubmit() {
        if (wallet && datum) {
            const scriptAddress = await TransactionUtil.getScriptAddressWithStakeCredential(wallet, SCRIPT, walletFrom);
            const recipient: Recipient = {
                address: scriptAddress,
                datum: {
                    value: datum,
                    inline: true
                }
            };
            const unsignedTx = await new Transaction({ initiator: wallet }).sendLovelace(recipient, String(deposit)).build();
            const signedTx = await wallet.signTx(unsignedTx);
            setTxHash(await wallet.submitTx(signedTx));
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


                    <Typography variant="h4">Setup New Payment</Typography>

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
                        <Typography variant="h4">My Payments</Typography>
                        <PaymentsTable />
                    </Stack>
                    : null}
            </Stack>

        </Box>
    );
}