import {
    Button,
    Stack,
    Tooltip
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {CodeBlock} from "react-code-blocks";
import {Send} from "@mui/icons-material";
import React, {useEffect, useState} from "react";
import {useWallet} from "@meshsdk/react";
import RecurringPaymentDatum from "../lib/interfaces/RecurringPaymentDatum";
import {Data, Recipient, Transaction} from "@meshsdk/core";
import TransactionUtil from "../lib/util/TransactionUtil";
import {CONSTANTS, SCRIPT} from "../lib/util/Constants";
import PaymentsTable from "./PaymentsTable";
import UserInput from "./UserInput";

export default function SetupRecurringPayment (props: {
    scriptAddress: string,
    hoskyInput : boolean,
    }) {

    const isDebugMode = false;

    const { scriptAddress, hoskyInput} = props;
    const { wallet, connected } = useWallet();

    const [ txHash, setTxHash ] = useState("" as string);
    const [datumDTO, setDatumDTO] = useState<RecurringPaymentDatum>(hoskyInput ?
        {owner: "", "amountToSend": [], "payee": "", "startTime": 0, "endTime": undefined, "paymentIntervalHours": 0, "maxPaymentDelayHours": undefined, "maxFeesLovelace": 0}
        :
        {owner: "", "amountToSend": [], "payee": "", "startTime": 0, "endTime": undefined, "paymentIntervalHours": 0, "maxPaymentDelayHours": undefined, "maxFeesLovelace": 0});
    const [datum, setDatum] = useState<Data>();

    useEffect(() => {
        if(connected) {
            TransactionUtil.createDatum(
                wallet,
                datumDTO
            ).then((datum) => {
                setDatum(datum);
            });
        }

    }, [datumDTO, scriptAddress, connected]);

    useEffect(() => {
        setDatumDTO({...datumDTO,
            amountToSend: [{
                assetName: "",
                policyId: "",
                amount: CONSTANTS.ASSET_AMOUNT_HOSKY
            }],
            paymentIntervalHours: 120
        });
    }, [hoskyInput]);

    async function signAndSubmit() {
        if (wallet && datum) {
            const scriptAddress = await TransactionUtil.getScriptAddressWithStakeCredential(wallet, SCRIPT);
            const recipient : Recipient = {
                address: scriptAddress,
                datum: {
                    value: datum,
                    inline: true
                }
            };
            console.log('data: ' + datum);
            const unsignedTx = await new Transaction({initiator: wallet}).sendLovelace(recipient, String("30000000")).build();
            const signedTx = await wallet.signTx(unsignedTx);
            setTxHash(await wallet.submitTx(signedTx));
        }
    }



    return (
        <div className={"body"}>
            <Stack spacing={1} alignContent={"center"} >
                <Grid container spacing={3} sx={{ padding: '5' }} alignItems={"center"} justifyContent={"center"}>
                    {/* <Grid size={6}> */}
                        <UserInput setDatumDTO={setDatumDTO} datumDTO={datumDTO} isHoskyInput={hoskyInput} />
                    {/* </Grid> */}
                    {isDebugMode ?
                        <Grid size={6}>
                            {connected ?
                                <Stack spacing={1}>
                                    <div><strong>Script Address:</strong>
                                        <Tooltip title={"The address of the smart contract. Click to copy to clipboard"}>
                                            <div style={{ overflowX: "hidden" }}
                                                onClick={() => navigator.clipboard.writeText(scriptAddress)}>
                                                {scriptAddress}
                                            </div>
                                        </Tooltip>
                                    </div>
                                    <CodeBlock customStyle={{
                                        maxHeight: '580px',
                                        overflow: 'scroll',
                                        textAlign: 'left',
                                    }} text={JSON.stringify(datum, (key, value) =>
                                        typeof value === 'bigint'
                                            ? value.toString()
                                            : value // return everything else unchanged
                                        , 4)} language='json'></CodeBlock>
                                </Stack> : <></>
                            }
                        </Grid> : null
                    }
                </Grid>
                <div>
                    <Button startIcon={<Send />} variant={"outlined"} onClick={() => signAndSubmit()}>Sign & Submit</Button>
                    {txHash !== "" ? <p>Transaction Hash: {txHash}</p> : <></>}
                </div>

                <PaymentsTable scriptAddress={scriptAddress} />
            </Stack>
        </div>
    );
}