import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import UploadIcon from '@mui/icons-material/Upload';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Box, Button, Grid2, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { ADAMATIC_HOST } from "../lib/util/Constants";
import { PaymentDetails, TransactionDetail } from "../lib/interfaces/AdaMaticTypes";
import dayjs from "dayjs";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const PaymentDetailsDialog = (props: { txHash: string | undefined, outputIndex: number | undefined, open: boolean, setOpen: (isOpen: boolean) => void }) => {

    const { txHash, outputIndex, open, setOpen } = props;

    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | undefined>(undefined)

    const [from, setFrom] = useState<string | undefined>(undefined)

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {

        console.log('open: ' + open);
        console.log('txHash: ' + txHash);
        console.log('outputIndex: ' + outputIndex);

        if (open && txHash && outputIndex != undefined) {

            let baseRequest = {
                tx_hash: txHash.toString(),
                output_index: outputIndex.toString(),
            };

            console.log('baseRequest: ' + JSON.stringify(baseRequest));

            fetch(ADAMATIC_HOST + '/recurring_payments/details?' + new URLSearchParams(baseRequest).toString())
                .then(data => data.json())
                .then((data: PaymentDetails) => {
                    console.log('data: ' + JSON.stringify(data));
                    setPaymentDetails(data);
                    const from = data.from;
                    console.log('from: ' + from);
                    setFrom(data.from);
                })

        }


    }, [txHash, outputIndex, open]);


    const getRandomId = () => {
        return (Math.random() + 1).toString(36).substring(7);
    }

    const shortenTxHash = (txHash: string) => {
        return txHash.substring(0, 8) + `...` + txHash.substring(txHash.length - 10);
    }

    const getTransactionRow = (transaction: TransactionDetail) => {
        switch (transaction.transaction_type) {
            case "CREATED":
                return (
                    <TableRow key={transaction.tx_hash ? transaction.tx_hash : getRandomId()}>
                        <TableCell >{dayjs(transaction.timestamp * 1_000).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                        <TableCell >
                            Payment Created <SaveAltIcon />
                        </TableCell>
                        <TableCell >
                            <Button href={"https://cardanoscan.io/transaction/" + transaction.tx_hash}
                                target="_blank"
                                rel="noopener"
                                endIcon={<LaunchIcon fontSize={"small"} />}>
                                {shortenTxHash(transaction.tx_hash ? shortenTxHash(transaction.tx_hash) : "")}
                            </Button>
                        </TableCell>
                        <TableCell>{transaction.balance.amount / 1_000_000} &#x20B3;</TableCell>
                    </TableRow>
                )
            case "PAYMENT_EXECUTED":
                return (
                    <TableRow key={transaction.tx_hash ? transaction.tx_hash : getRandomId()}>
                        <TableCell >{dayjs(transaction.timestamp * 1_000).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                        <TableCell >
                            Payment Executed <ShoppingCartCheckoutIcon />
                        </TableCell>
                        <TableCell >
                            <Button href={"https://cardanoscan.io/transaction/" + transaction.tx_hash}
                                target="_blank"
                                rel="noopener"
                                endIcon={<LaunchIcon fontSize={"small"} />}>
                                {shortenTxHash(transaction.tx_hash ? shortenTxHash(transaction.tx_hash) : "")}
                            </Button>
                        </TableCell>
                        <TableCell>{transaction.balance.amount / 1_000_000} &#x20B3;</TableCell>
                    </TableRow>
                )
            case "WITHDRAWN":
                return (
                    <TableRow key={transaction.tx_hash ? transaction.tx_hash : getRandomId()}>
                        <TableCell >{dayjs(transaction.timestamp * 1_000).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                        <TableCell >
                            Payment Withdrawn <UploadIcon />
                        </TableCell>
                        <TableCell >
                            <Button href={"https://cardanoscan.io/transaction/" + transaction.tx_hash}
                                target="_blank"
                                rel="noopener"
                                endIcon={<LaunchIcon fontSize={"small"} />}>
                                {shortenTxHash(transaction.tx_hash ? shortenTxHash(transaction.tx_hash) : "")}
                            </Button>
                        </TableCell>
                        <TableCell>{transaction.balance.amount / 1_000_000} &#x20B3;</TableCell>
                    </TableRow>
                )
            case "COMPLETED":
                return (
                    <TableRow key={transaction.tx_hash ? transaction.tx_hash : getRandomId()}>
                        <TableCell >{dayjs(transaction.timestamp * 1_000).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                        <TableCell >
                            Payment Completed <CheckBoxIcon />
                        </TableCell>
                        <TableCell >
                            <Button href={"https://cardanoscan.io/transaction/" + transaction.tx_hash}
                                target="_blank"
                                rel="noopener"
                                endIcon={<LaunchIcon fontSize={"small"} />}>
                                {shortenTxHash(transaction.tx_hash ? shortenTxHash(transaction.tx_hash) : "")}
                            </Button>
                        </TableCell>
                        <TableCell>{transaction.balance.amount / 1_000_000} &#x20B3;</TableCell>
                    </TableRow>
                )
            case "SCHEDULED":
                return (
                    <TableRow key={transaction.tx_hash ? transaction.tx_hash : getRandomId()}>
                        <TableCell >{dayjs(transaction.timestamp * 1_000).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                        <TableCell >
                            Payment Scheduled <AccessAlarmIcon />
                        </TableCell>
                        <TableCell >
                            -
                        </TableCell>
                        <TableCell>{transaction.balance.amount / 1_000_000} &#x20B3;</TableCell>
                    </TableRow>
                )
            default:
                return (null);

        }
    }


    return (
        <>

            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Hosky Auto Pull Details
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent dividers>

                    <Stack alignItems={"center"} >

                        <Stack width={"100%"} minHeight={"800px"}
                            spacing={2}
                            padding={2}
                        // sx={{ border: 2, borderColor: "#999999", borderRadius: "20px" }}
                        >

                            <TextField
                                id="id-from"
                                label="From (Stake Address)"
                                value={paymentDetails ? paymentDetails.from : "N/A"}
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                            />

                            <TextField
                                id="id-to"
                                label="To"
                                value={paymentDetails ? paymentDetails.to : "N/A"}
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                            />

                            <Grid2 spacing={2} container justifyContent={"space-between"}>
                                <Grid2 size={4}>
                                    <TextField
                                        fullWidth
                                        id="id-amount"
                                        label="Amount"
                                        value={paymentDetails ? (paymentDetails.amount.amount / 1_000_00) : "N/A"}
                                        slotProps={{
                                            input: {
                                                readOnly: true,
                                                endAdornment: <Button> ADA </Button>,
                                            },
                                        }}
                                    />
                                </Grid2>

                                <Grid2 size={4}>
                                    <TextField
                                        fullWidth
                                        id="id-deposit"
                                        label="Initial deposit"
                                        value={paymentDetails ? (paymentDetails.initial_deposit.amount / 1_000_000) : "N/A"}
                                        slotProps={{
                                            input: {
                                                readOnly: true,
                                                endAdornment: <Button> ADA </Button>,
                                            },
                                        }}
                                    />
                                </Grid2>
                                <Grid2 size={4}>
                                    <TextField
                                        fullWidth
                                        id="id-max-fee"
                                        label="Max Fee"
                                        value={paymentDetails ? (paymentDetails.max_fee / 1_000_000) : "N/A"}
                                        slotProps={{
                                            input: {
                                                readOnly: true,
                                                endAdornment: <Button> ADA </Button>,
                                            },
                                        }}
                                    />
                                </Grid2>
                            </Grid2>

                            <Grid2 spacing={2} container justifyContent={"space-between"}>

                                <Grid2 size={3}>
                                    <TextField
                                        fullWidth
                                        id="id-epoch-start"
                                        label="Epoch Start"
                                        value={paymentDetails ? paymentDetails.epoch_start : "N/A"}
                                        slotProps={{
                                            input: {
                                                readOnly: true,
                                            },
                                        }}
                                    />
                                </Grid2>

                                <Grid2 size={3}>
                                    <TextField
                                        fullWidth
                                        id="id-epoch-end"
                                        label="Epoch End"
                                        value={paymentDetails ? paymentDetails.epoch_end : "N/A"}
                                        slotProps={{
                                            input: {
                                                readOnly: true,
                                            },
                                        }}
                                    />
                                </Grid2>

                                <Grid2 size={3}>
                                    <TextField
                                        fullWidth
                                        id="id-num-pulls"
                                        label="Num Pulls"
                                        value={paymentDetails ? paymentDetails.num_pulls : "N/A"}
                                        slotProps={{
                                            input: {
                                                readOnly: true,
                                            },
                                        }}
                                    />
                                </Grid2>

                                <Grid2 size={3}>
                                    <TextField
                                        fullWidth
                                        id="id-epoch-interval"
                                        label="Epoch Interval"
                                        value={paymentDetails ? paymentDetails.epoch_interval : "N/A"}
                                        slotProps={{
                                            input: {
                                                readOnly: true,
                                            },
                                        }}
                                    />
                                </Grid2>

                            </Grid2>

                            <Typography variant="h5" marginTop={2}>
                                Payments History
                            </Typography>

                            <TableContainer component={Paper}>
                                <Table aria-label="Payments Table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell key="date-time">Date and Time</TableCell>
                                            <TableCell key="payment-event">Payment Event</TableCell>
                                            <TableCell key="tx-hash">Tx Hash</TableCell>
                                            <TableCell key="balance">Balance</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paymentDetails ? paymentDetails.transactions.map((transaction) => (
                                            getTransactionRow(transaction)
                                        )) : null}

                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleClose}>
                        Close
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </>
    )

}

export default PaymentDetailsDialog;