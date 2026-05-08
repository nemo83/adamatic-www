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
import { fetchPaymentDetails } from "../../../lib/api/adamatic";
import type { PaymentDetails, TransactionDetail } from "../../../types/AdaMaticTypes";
import dayjs from "dayjs";
import { useTranslations } from "../../../lib/i18n/I18nProvider";

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

    const t = useTranslations();

    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | undefined>(undefined)

    const [from, setFrom] = useState<string | undefined>(undefined)

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        if (open && txHash && outputIndex != undefined) {
            fetchPaymentDetails(txHash, outputIndex).then((data) => {
                if (!data) return;
                setPaymentDetails(data);
                setFrom(data.from);
            });
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
                            {t("paymentDetails.event.created")} <SaveAltIcon />
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
                            {t("paymentDetails.event.executed")} <ShoppingCartCheckoutIcon />
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
                            {t("paymentDetails.event.withdrawn")} <UploadIcon />
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
                            {t("paymentDetails.event.completed")} <CheckBoxIcon />
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
                            {t("paymentDetails.event.scheduled")} <AccessAlarmIcon />
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
                    {t("paymentDetails.title")}
                </DialogTitle>
                <IconButton
                    aria-label={t("paymentDetails.closeAria")}
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
                                label={t("paymentDetails.from")}
                                value={paymentDetails ? paymentDetails.from : t("paymentDetails.na")}
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                            />

                            <TextField
                                id="id-to"
                                label={t("paymentDetails.to")}
                                value={paymentDetails ? paymentDetails.to : t("paymentDetails.na")}
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
                                        label={t("paymentDetails.amount")}
                                        value={paymentDetails ? (paymentDetails.amount.amount / 1_000_000) : t("paymentDetails.na")}
                                        slotProps={{
                                            input: {
                                                readOnly: true,
                                                endAdornment: <Button> {t("common.ada")} </Button>,
                                            },
                                        }}
                                    />
                                </Grid2>

                                <Grid2 size={4}>
                                    <TextField
                                        fullWidth
                                        id="id-deposit"
                                        label={t("paymentDetails.initialDeposit")}
                                        value={paymentDetails ? (paymentDetails.initial_deposit.amount / 1_000_000) : t("paymentDetails.na")}
                                        slotProps={{
                                            input: {
                                                readOnly: true,
                                                endAdornment: <Button> {t("common.ada")} </Button>,
                                            },
                                        }}
                                    />
                                </Grid2>
                                <Grid2 size={4}>
                                    <TextField
                                        fullWidth
                                        id="id-max-fee"
                                        label={t("paymentDetails.maxFee")}
                                        value={paymentDetails ? (paymentDetails.max_fee / 1_000_000) : t("paymentDetails.na")}
                                        slotProps={{
                                            input: {
                                                readOnly: true,
                                                endAdornment: <Button> {t("common.ada")} </Button>,
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
                                        label={t("paymentDetails.epochStart")}
                                        value={paymentDetails ? paymentDetails.epoch_start : t("paymentDetails.na")}
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
                                        label={t("paymentDetails.epochEnd")}
                                        value={paymentDetails ? paymentDetails.epoch_end : t("paymentDetails.na")}
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
                                        label={t("paymentDetails.numPulls")}
                                        value={paymentDetails ? paymentDetails.num_pulls : t("paymentDetails.na")}
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
                                        label={t("paymentDetails.epochInterval")}
                                        value={paymentDetails ? paymentDetails.epoch_interval : t("paymentDetails.na")}
                                        slotProps={{
                                            input: {
                                                readOnly: true,
                                            },
                                        }}
                                    />
                                </Grid2>

                            </Grid2>

                            <Typography variant="h5" marginTop={2}>
                                {t("paymentDetails.historyTitle")}
                            </Typography>

                            <TableContainer component={Paper}>
                                <Table aria-label={t("paymentDetails.tableAria")}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell key="date-time">{t("paymentDetails.table.dateTime")}</TableCell>
                                            <TableCell key="payment-event">{t("paymentDetails.table.event")}</TableCell>
                                            <TableCell key="tx-hash">{t("paymentDetails.table.txHash")}</TableCell>
                                            <TableCell key="balance">{t("paymentDetails.table.balance")}</TableCell>
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
                        {t("paymentDetails.close")}
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </>
    )

}

export default PaymentDetailsDialog;