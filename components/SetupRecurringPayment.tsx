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
import {SCRIPT} from "../lib/util/Constants";
import PaymentsTable from "./PaymentsTable";
import UserInput from "./UserInput";


export default function SetupRecurringPayment (props: {
    scriptAddress: string,
    hoskyInput : boolean,
    }) {

    const { scriptAddress, hoskyInput} = props;
    const { wallet, connected } = useWallet();

    const [ txHash, setTxHash ] = useState("" as string);
    const [datumDTO, setDatumDTO] = useState<RecurringPaymentDatum>({amountToDeposit: 0, "assetAmounts": [], "payAddress": "", "startTime": 0, "endTime": undefined, "paymentIntervalHours": 0, "maxPaymentDelayHours": undefined, "maxFeesLovelace": 0});
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

    }, [datumDTO, scriptAddress]);

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
            const unsignedTx = await new Transaction({initiator: wallet}).sendLovelace(recipient, String(datumDTO.amountToDeposit)).build();
            const signedTx = await wallet.signTx(unsignedTx);
            setTxHash(await wallet.submitTx(signedTx));
        }
    }



    return (
        <div className={"body"}>
        <Stack spacing={1} alignContent={"center"}>
            <Grid container spacing={3} sx={{padding: '5'}}>
                <Grid size={6}>
                    {hoskyInput ?
                        <HoskyUserInput setDatumDTO={setDatumDTO} datumDTO={datumDTO}/> :
                        <UserInput setDatumDTO={setDatumDTO} datumDTO={datumDTO}/>
                    }

                </Grid>
                <Grid size={6}>
                    {connected ?
                        <Stack spacing={1}>
                            <div><strong>Script Address:</strong>
                                <Tooltip title={"The address of the smart contract. Click to copy to clipboard"}>
                                    <div style={{overflowX: "hidden"}}
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
                </Grid>
            </Grid>
            <div>
                <Button startIcon={<Send/>} variant={"outlined"} onClick={() => signAndSubmit()}>Sign & Submit</Button>
                {txHash !== "" ? <p>Transaction Hash: {txHash}</p> : <></>}
            </div>

            <PaymentsTable scriptAddress={scriptAddress} />
        </Stack>
    </div>
    );
}