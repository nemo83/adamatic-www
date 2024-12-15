import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import LaunchIcon from '@mui/icons-material/Launch';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadIcon from '@mui/icons-material/Upload';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Box, Button, Grid2, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { ADAMATIC_HOST } from "../../lib/util/Constants";
import { PaymentDetails, TransactionDetail } from "../../lib/interfaces/AdaMaticTypes";
import dayjs from "dayjs";

const DetailPage = () => {

    const router = useRouter()

    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | undefined>(undefined)
    
    const [from, setFrom] = useState<string | undefined>(undefined)

    useEffect(() => {

        const query = router.query;

        if (query && query.tx_hash && query.output_index) {

            let baseRequest = {
                tx_hash: query.tx_hash.toString(),
                output_index: query.output_index.toString(),
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


    }, [router]);


    const getTransactionRow = (transaction: TransactionDetail) => {
        switch (transaction.transaction_type) {
            case "CREATED":
                return (
                    <TableRow key={transaction.tx_hash}>
                        <TableCell >{dayjs(transaction.timestamp * 1_000).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                        <TableCell >
                            Payment Created <SaveAltIcon />
                        </TableCell>
                        <TableCell >
                            <Button href={"https://cardanoscan.io/transaction/" + transaction.tx_hash}
                                target="_blank"
                                rel="noopener"
                                endIcon={<LaunchIcon fontSize={"small"} />}>
                                {transaction.tx_hash.substring(0, 8) + `...` + transaction.tx_hash.substring(transaction.tx_hash.length - 10)}
                            </Button>
                        </TableCell>
                        <TableCell>{transaction.balance.amount / 1_000_000} &#x20B3;</TableCell>
                    </TableRow>
                )
            case "PAYMENT_EXECUTED":
                return (
                    <TableRow key={transaction.tx_hash}>
                        <TableCell >{dayjs(transaction.timestamp * 1_000).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                        <TableCell >
                            Payment Executed <ShoppingCartCheckoutIcon />
                        </TableCell>
                        <TableCell >
                            <Button href={"https://cardanoscan.io/transaction/" + transaction.tx_hash}
                                target="_blank"
                                rel="noopener"
                                endIcon={<LaunchIcon fontSize={"small"} />}>
                                {transaction.tx_hash.substring(0, 8) + `...` + transaction.tx_hash.substring(transaction.tx_hash.length - 10)}
                            </Button>
                        </TableCell>
                        <TableCell>{transaction.balance.amount / 1_000_000} &#x20B3;</TableCell>
                    </TableRow>
                )
            case "WITHDRAWN":
                return (
                    <TableRow key={transaction.tx_hash}>
                        <TableCell >{dayjs(transaction.timestamp * 1_000).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                        <TableCell >
                            Payment Withdrawn <UploadIcon />
                        </TableCell>
                        <TableCell >
                            <Button href={"https://cardanoscan.io/transaction/" + transaction.tx_hash}
                                target="_blank"
                                rel="noopener"
                                endIcon={<LaunchIcon fontSize={"small"} />}>
                                {transaction.tx_hash.substring(0, 8) + `...` + transaction.tx_hash.substring(transaction.tx_hash.length - 10)}
                            </Button>
                        </TableCell>
                        <TableCell>{transaction.balance.amount / 1_000_000} &#x20B3;</TableCell>
                    </TableRow>
                )
            case "COMPLETED":
                return (
                    <TableRow key={transaction.tx_hash}>
                        <TableCell >{dayjs(transaction.timestamp * 1_000).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                        <TableCell >
                            Payment Completed <CheckBoxIcon />
                        </TableCell>
                        <TableCell >
                            <Button href={"https://cardanoscan.io/transaction/" + transaction.tx_hash}
                                target="_blank"
                                rel="noopener"
                                endIcon={<LaunchIcon fontSize={"small"} />}>
                                {transaction.tx_hash.substring(0, 8) + `...` + transaction.tx_hash.substring(transaction.tx_hash.length - 10)}
                            </Button>
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
            <Navbar />

            <Stack alignItems={"center"} >


                <Button href="/">
                    <ArrowBackIcon />
                    Back
                </Button>

                <Typography variant="h4" marginTop={2}>
                    Hosky Auto Pull Details
                </Typography>

                <Stack width={"750px"} maxWidth={"60%"} minHeight={"800px"}
                    spacing={2}
                    padding={4}
                    sx={{ border: 2, borderColor: "#999999", borderRadius: "20px" }}
                >

                    <TextField
                        id="id-from"
                        label="From (Stake Address)"
                        defaultValue="N/A"
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
                        defaultValue="N/A"
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
                                defaultValue="N/A"
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
                                defaultValue="N/A"
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
                                defaultValue="N/A"
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
                                defaultValue="N/A"
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
                                defaultValue="N/A"
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
                                defaultValue="N/A"
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
                                defaultValue="N/A"
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
                        Payments
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

        </>
    )

}

export default DetailPage;