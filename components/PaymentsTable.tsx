import { Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useEffect, useState } from "react";
import RecurringPayment from "../lib/interfaces/RecurringPayment";
import TransactionUtil from "../lib/util/TransactionUtil";
import { useWallet } from "@meshsdk/react";
import { ADAMATIC_HOST, SCRIPT } from "../lib/util/Constants";
import dayjs from "dayjs";
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';


export default function PaymentsTable(props: { walletFrom: string }) {

    const { walletFrom } = props;

    const { wallet, connected } = useWallet();

    const [recurringPaymentDTOs, setRecurringPaymentDTOs] = useState<RecurringPayment[]>([]);

    useEffect(() => {
        if (connected) {
            wallet
                .getUsedAddress()
                .then((address) => {
                    const paymentPubKeyHash = address.asBase()!.getPaymentCredential().hash.toString();
                    return fetch(ADAMATIC_HOST + '/recurring_payments/public_key_hash/' + paymentPubKeyHash);
                })
                .then(response => response.json())
                .then(data => {
                    console.log('data: ' + JSON.stringify(data));
                    let recurringPaymentDTOs: RecurringPayment[] = [];
                    data.forEach((recurringPayment: any) => {
                        recurringPaymentDTOs.push({
                            txHash: recurringPayment.tx_hash,
                            output_index: recurringPayment.output_index,
                            balance: recurringPayment.balance,
                            amountToSend: [],
                            payee: recurringPayment.payee,
                            startTime: dayjs(recurringPayment.start_time_timestamp),
                            endTime: undefined,
                            paymentIntervalHours: 0,
                            maxPaymentDelayHours: 0,
                            maxFeesLovelace: recurringPayment.max_fees_lovelace
                        });
                    });
                    setRecurringPaymentDTOs(recurringPaymentDTOs);
                })
        }
    }, [connected]);

    async function cancelRecurringPayment(recurringPaymentDTO: RecurringPayment) {
        const scriptAddress = await TransactionUtil.getScriptAddressWithStakeCredential(wallet, SCRIPT, walletFrom);
        const tx = await TransactionUtil.getUnsignedCancelTx(recurringPaymentDTO, scriptAddress, wallet);
        const unsignedTx = await tx.build();
        const signedTx = await wallet.signTx(unsignedTx);
        console.log(await wallet.submitTx(signedTx));
    }

    return (
        <>
            {connected ?
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Hash</TableCell>
                                <TableCell>Payee</TableCell>
                                <TableCell>Next run</TableCell>
                                <TableCell>Amount (ada)</TableCell>

                                <TableCell>Cancel</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recurringPaymentDTOs.map((row) => (
                                <TableRow
                                    key={row.txHash}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        <Button href={"https://cardanoscan.io/transaction/" + row.txHash}
                                            endIcon={<LaunchIcon />}                                        >
                                            {row.txHash.substring(0, 10) + "..." + row.txHash.substring(row.txHash.length - 10)}
                                        </Button>

                                    </TableCell>
                                    <TableCell>{row.payee.substring(0, 10) + "..." + row.payee.substring(row.payee.length - 10)}</TableCell>
                                    <TableCell>{row.startTime.format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                                    <TableCell>2</TableCell>

                                    <TableCell>
                                        <IconButton aria-label="delete"
                                            onClick={() => cancelRecurringPayment(row)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer> : <></>}
        </>
    );
}