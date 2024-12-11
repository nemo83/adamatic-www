import { Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useEffect, useState } from "react";
import RecurringPayment from "../lib/interfaces/RecurringPayment";
import TransactionUtil from "../lib/util/TransactionUtil";
import { useWallet } from "@meshsdk/react";
import { Address } from "@meshsdk/core-cst";
import { ADAMATIC_HOST, SCRIPT } from "../lib/util/Constants";
import dayjs from "dayjs";
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';


export default function PaymentsTable(props: { version: number }) {

    const { version } = props;

    const { wallet, connected } = useWallet();

    const [recurringPaymentDTOs, setRecurringPaymentDTOs] = useState<RecurringPayment[]>([]);

    useEffect(() => {
        if (connected) {
            reloadPayments();
        }
    }, [connected]);

    useEffect(() => {
        console.log('version: ' + version);
        reloadPayments();
    }, [version]);

    const reloadPayments = async () => {
        wallet
            .getUsedAddresses()
            .then((addresses) => {
                const address = Address.fromBech32(addresses[0])
                const paymentPubKeyHash = address.asBase()!.getPaymentCredential().hash.toString();
                return fetch(ADAMATIC_HOST + '/recurring_payments/public_key_hash/' + paymentPubKeyHash);
            })
            .then(response => response.json())
            .then(data => {
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

    async function cancelRecurringPayment(recurringPaymentDTO: RecurringPayment) {
        // const scriptAddress = await TransactionUtil.getScriptAddressWithStakeCredential(wallet, SCRIPT);
        const unsignedTx = await TransactionUtil.getUnsignedCancelTx(recurringPaymentDTO, wallet);
        const signedTx = await wallet.signTx(unsignedTx);
        const txHash = await wallet.submitTx(signedTx);
    }

    return (
        <>
            {connected ?
                <TableContainer component={Paper}>
                    <Table aria-label="Payments Table">
                        <TableHead>
                            <TableRow>
                                {/* <TableCell>Hash</TableCell> */}
                                <TableCell>Payee</TableCell>
                                <TableCell>Next run</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>&nbsp;</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recurringPaymentDTOs.map((row) => (
                                <TableRow
                                    key={row.txHash}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    {/* <TableCell component="th" scope="row">
                                        <Button href={"https://cardanoscan.io/transaction/" + row.txHash}
                                            endIcon={<LaunchIcon />}                                        >
                                            {row.txHash.substring(0, 10) + "..." + row.txHash.substring(row.txHash.length - 10)}
                                        </Button>

                                    </TableCell> */}
                                    <TableCell>
                                        <Button href={"https://cardanoscan.io/transaction/" + row.txHash}
                                            endIcon={<LaunchIcon />}                                        >
                                            {row.payee.substring(0, 10) + "..." + row.payee.substring(row.payee.length - 10)}
                                        </Button>
                                    </TableCell>
                                    <TableCell>{row.startTime.format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                                    <TableCell>2 ADA</TableCell>

                                    <TableCell>
                                        <IconButton aria-label="delete"
                                            onClick={() => cancelRecurringPayment(row)}>
                                            <DeleteIcon color="error" />
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