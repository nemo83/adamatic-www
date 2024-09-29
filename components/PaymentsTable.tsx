import {Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import {Delete} from "@mui/icons-material";
import React, {useEffect, useState} from "react";
import RecurringPayment from "../lib/interfaces/RecurringPayment";
import TransactionUtil from "../lib/util/TransactionUtil";
import {useWallet} from "@meshsdk/react";
import {SCRIPT} from "../lib/util/Constants";
import TxInfo from "../lib/interfaces/TxInfo";

export default function PaymentsTable(props: {scriptAddress : string}) {

    const { wallet, connected } = useWallet();
    const { scriptAddress} = props;

    const [recurringPaymentDTOs, setRecurringPaymentDTOs] = useState<RecurringPayment[]>([]);

    useEffect(() => {
        if(connected && scriptAddress !== "") {
            fetch('api/GetScriptUTXOs', {method: "POST", body: scriptAddress}).then(response => response.json()).then(data => {
                const utxos : TxInfo[] = JSON.parse(data.utxo);
                let recurringPayments : RecurringPayment[] = [];
                utxos.forEach((utxo) => {
                    recurringPayments.push(TransactionUtil.deserializeDatum(utxo));
                });
                setRecurringPaymentDTOs(recurringPayments);
            });
        }
    }, [scriptAddress, connected]);

    async function cancelRecurringPayment(recurringPaymentDTO : RecurringPayment) {
        const scriptAddress = await TransactionUtil.getScriptAddressWithStakeCredential(wallet, SCRIPT);
        const tx = await TransactionUtil.getUnsignedCancelTx(recurringPaymentDTO, scriptAddress, wallet);
        const unsignedTx = await tx.build();
        const signedTx = await wallet.signTx(unsignedTx);
        console.log(await wallet.submitTx(signedTx));
    }

    return (
        <>
        {connected ?
                <TableContainer component={Paper}>
                    <Table sx={{minWidth: 650}} aria-label="simple table">
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
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                >
                                    <TableCell component="th" scope="row">
                                        {row.txHash}
                                    </TableCell>
                                    <TableCell>{row.payeePaymentPkh}</TableCell>
                                    <TableCell>{row.startTime.toDateString() + " " + row.startTime.getHours() + ":" + row.startTime.getMinutes()}</TableCell>
                                    <TableCell>{row.amounts[0].quantity}</TableCell>
                                    <TableCell>{row.maxFeesLovelace}</TableCell>

                                    <TableCell>
                                        <Button variant="outlined" startIcon={<Delete/>}
                                                onClick={() => cancelRecurringPayment(row)}>
                                            Cancel
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer> : <></>}
        </>
    );
}