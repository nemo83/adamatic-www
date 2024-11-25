import {
    Box,
    Button,
    Grid,
    Grid2,
    Stack,
    Tooltip
} from "@mui/material";
import { Send } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useWallet } from "@meshsdk/react";
import RecurringPaymentDatum from "../lib/interfaces/RecurringPaymentDatum";
import { Data, Recipient, Transaction } from "@meshsdk/core";
import TransactionUtil from "../lib/util/TransactionUtil";
import { HOSKY_TOUR_DISPLAYED, SCRIPT } from "../lib/util/Constants";
import PaymentsTable from "./PaymentsTable";
import UserInput from "./UserInput";
import { TourProvider, useTour } from '@reactour/tour'

export default function SetupRecurringPayment(props: {
    isValidNetwork: boolean,
    hoskyInput: boolean,
}) {

    const isDebugMode = false;

    const { setIsOpen } = useTour();

    useEffect(() => {
        const hoskyTourDisplayed = localStorage.getItem(HOSKY_TOUR_DISPLAYED);
        console.log('hoskyTourDisplayed: ' + hoskyTourDisplayed);
        if (!hoskyTourDisplayed) {
            setIsOpen(true);
            console.log('hoskyTourDisplayed is null');
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
            console.log('data: ' + datum);
            const unsignedTx = await new Transaction({ initiator: wallet }).sendLovelace(recipient, String(deposit)).build();
            const signedTx = await wallet.signTx(unsignedTx);
            setTxHash(await wallet.submitTx(signedTx));
        }
    }

    return (
        <div className={"body"}>

            <Stack spacing={4} sx={{ alignItems: "center" }} >

                <Box width={"60%"}
                    sx={{
                        marginTop: "10rem"
                    }}
                >

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
                        <Button disabled={!isValidNetwork} variant="contained" startIcon={<Send />} onClick={() => signAndSubmit()}>Sign & Submit</Button>
                    </Grid2>
                </Grid2>
                <Box>
                    <PaymentsTable />
                </Box>
            </Stack>

        </div >
    );
}