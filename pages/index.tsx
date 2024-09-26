import React, {useEffect, useState} from "react";
import { useWallet} from "@meshsdk/react";
import {
    Data, mConStr0,
    Recipient,
    Transaction, UTxO
} from "@meshsdk/core";
import TransactionUtil from "../lib/util/TransactionUtil";
import DatumDTO from "../lib/interfaces/DatumDTO";
import {SCRIPT} from "../lib/util/Constants";
import Navbar from "../components/Navbar";
import UserInput from "../components/UserInput";
import Grid from "@mui/material/Grid2";
import {
    Box,
    Button,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow, Tooltip,
} from "@mui/material";
import GetScriptTransactionsResponse from "../lib/interfaces/GetScriptTransactionsResponse";
import RecurringPaymentDTO from "../lib/interfaces/RecurringPaymentDTO";
import {Delete, Send} from "@mui/icons-material";
import {CodeBlock} from "react-code-blocks";

export default function Home() {

    const { wallet, connected } = useWallet();
    const [ txHash, setTxHash ] = useState("" as string);
    const [datumDTO, setDatumDTO] = useState<DatumDTO>({amountToDeposit: 0, "assetAmounts": [], "payAddress": "", "startTime": 0, "endTime": undefined, "paymentIntervalHours": 0, "maxPaymentDelayHours": undefined, "maxFeesLovelace": 0});
    const [networkID, setNetworkID] = useState(0 as number);
    const [network, setNetwork] = useState("" as string);
    const [validNetwork, setValidNetwork] = useState(false as boolean);
    const [scriptAddress, setScriptAddress] = useState("" as string);
    const [recurringPaymentDTOs, setRecurringPaymentDTOs] = useState<RecurringPaymentDTO[]>([]);
    const [datum, setDatum] = useState<Data>();

    useEffect(() => {
        if (connected) {
            wallet.getNetworkId().then((id) => {
                setNetworkID(id);
                setNetwork(networkID == 0 ? "Testnet" : "Mainnet")
                // @ts-ignore
                if(id === +process.env.NEXT_PUBLIC_NETWORK) {
                    setValidNetwork(true);
                    TransactionUtil.getScriptAddressWithStakeCredential(wallet, SCRIPT).then((address) => {
                        setScriptAddress(address);

                    });
                } else {
                    setNetworkID(id);
                    setValidNetwork(false);

                }
            });
        }
    }, [wallet]);

    useEffect(() => {
        if(connected) {
            fetch('api/GetScriptUTXOs', {method: "POST", body: scriptAddress}).then(response => response.json()).then(data => {
                const utxos : GetScriptTransactionsResponse[] = JSON.parse(data.utxo);
                let recurringPayments : RecurringPaymentDTO[] = [];
                utxos.forEach((utxo) => {
                    recurringPayments.push(TransactionUtil.deserializeDatum(utxo));
                });
                setRecurringPaymentDTOs(recurringPayments);
            });
            TransactionUtil.createDatum(
                wallet,
                datumDTO
            ).then((datum) => {
                setDatum(datum);
            });
        }
    }, [scriptAddress]);

    useEffect(() => {
        if(connected) {
            TransactionUtil.createDatum(
                wallet,
                datumDTO
            ).then((datum) => {
                setDatum(datum);
            });
        }

    }, [datumDTO]);

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

    async function cancelRecurringPayment(recurringPaymentDTO : RecurringPaymentDTO) {
        const tx = await TransactionUtil.getUnsignedCancelTx(recurringPaymentDTO, scriptAddress, wallet);
        const unsignedTx = await tx.build();
        const signedTx = await wallet.signTx(unsignedTx);
        console.log(await wallet.submitTx(signedTx));

    }


    return (
        <>
            <Navbar network={network} isValidNetwork={validNetwork}></Navbar>
            <div className={"body"}>
                <Stack spacing={1} alignContent={"center"}>
                    <Grid container spacing={3} sx={{padding:'5'}}>
                        <Grid size={6}>
                            <UserInput setDatumDTO={setDatumDTO} datumDTO={datumDTO} />
                        </Grid>
                        <Grid size={6}>
                            {connected ?
                                <Stack spacing={1}>
                                    <div><strong>Script Address:</strong>
                                        <Tooltip title={"The address of the smart contract. Click to copy to clipboard"}>
                                            <div style={{overflowX: "hidden"}} onClick={() => navigator.clipboard.writeText(scriptAddress)}>
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
                    {connected ?
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>txHash</TableCell>
                                    <TableCell>PayeePaymentPkh</TableCell>
                                    <TableCell>StartTime</TableCell>
                                    <TableCell>Amount in Lovelace</TableCell>
                                    <TableCell>MaxFeesLovelace</TableCell>
                                    <TableCell>Cancel Payment</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recurringPaymentDTOs.map((row) => (
                                    <TableRow
                                        key={row.txHash}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.txHash}
                                        </TableCell>
                                        <TableCell>{row.payeePaymentPkh}</TableCell>
                                        <TableCell>{row.startTime.toDateString() + " " + row.startTime.getHours() + ":" + row.startTime.getMinutes()}</TableCell>
                                        <TableCell>{row.amounts[0].quantity}</TableCell>
                                        <TableCell>{row.maxFeesLovelace}</TableCell>

                                        <TableCell>
                                            <Button variant="outlined" startIcon={<Delete />} onClick={() => cancelRecurringPayment(row)}>
                                                Cancel
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer> : <></> }
                </Stack>
            </div>
        </>
    );
}
