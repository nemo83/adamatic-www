import { useRouter } from "next/router";
import React from "react";
import Navbar from "../../components/Navbar";
import LaunchIcon from '@mui/icons-material/Launch';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import { Box, Button, Grid2, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";


const DetailPage = () => {

    const router = useRouter()

    return (
        <>
            <Navbar />

            <div>Detail page: {JSON.stringify(router.query)}</div>

            <Stack alignItems={"center"} >

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
                        slotProps={{
                            input: {
                                readOnly: true,
                            },
                        }}
                    />

                    <Grid2 spacing={2} container justifyContent={"space-between"}>
                        <Grid2 size={2}>
                            <TextField
                                fullWidth
                                id="id-amount"
                                label="Amount"
                                defaultValue="N/A"
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                            />
                        </Grid2>

                        <Grid2 size={2}>
                            <TextField
                                fullWidth
                                id="id-num-pulls"
                                label="Num Pulls"
                                defaultValue="N/A"
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
                                id="id-deposit"
                                label="Initial deposit"
                                defaultValue="N/A"
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                            />
                        </Grid2>
                        <Grid2 size={2}>
                            <TextField
                                fullWidth
                                id="id-max-fee"
                                label="Max Fee"
                                defaultValue="N/A"
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                            />
                        </Grid2>
                    </Grid2>

                    <Grid2 spacing={2} container justifyContent={"space-between"}>

                        <Grid2 size={6}>
                            {/* <TextField type={"number"} label={"First Epoch"} value={epochStart} name={"startEpoch"} onChange={(event) => updateStuff(parseInt(event.target.value), Math.floor((epochEnd - epochStart) / paymentIntervalEpochs), paymentIntervalEpochs)}
                            slotProps={{
                                input: {
                                    endAdornment: <InputAdornment position="end">{startTime!.format('DD.MM.YYYY HH:mm')}</InputAdornment>,
                                },
                            }}
                            data-tut="step-5"
                        /> */}
                            <TextField
                                fullWidth
                                id="id-epoch-start"
                                label="Epoch Start"
                                defaultValue="N/A"
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                            />
                        </Grid2>

                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                id="id-epoch-end"
                                label="Epoch End"
                                defaultValue="N/A"
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
                                    <TableCell>Date and Time</TableCell>
                                    <TableCell>Payment Event</TableCell>
                                    <TableCell>Tx Hash</TableCell>
                                    <TableCell>Balance</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow key="hash">
                                    <TableCell>2024-12-10 09:45:44</TableCell>
                                    <TableCell>Payment Created <SaveAltIcon /></TableCell>
                                    <TableCell>
                                        <Button href={"https://cardanoscan.io/stakekey/"}
                                            target="_blank"
                                            rel="noopener"
                                            endIcon={<LaunchIcon fontSize={"small"} />}                                        >
                                            stake1...23423rwvergrtg
                                        </Button>
                                    </TableCell>
                                    <TableCell>25.0 &#x20B3;</TableCell>
                                </TableRow>
                                <TableRow key="hash">
                                    <TableCell>2024-12-12 09:45:44</TableCell>
                                    <TableCell>Payment Executed <ShoppingCartCheckoutIcon /></TableCell>
                                    <TableCell>
                                        <Button href={"https://cardanoscan.io/stakekey/"}
                                            target="_blank"
                                            rel="noopener"
                                            endIcon={<LaunchIcon fontSize={"small"} />}                                        >
                                            stake1...23423rwvergrtg
                                        </Button>
                                    </TableCell>
                                    <TableCell>22.5 &#x20B3;</TableCell>
                                </TableRow>
                                <TableRow key="hash">
                                    <TableCell>2024-12-17 09:45:44</TableCell>
                                    <TableCell>Payment Scheduled <AccessAlarmIcon fontSize={"small"} /></TableCell>
                                    <TableCell>
                                        N/A
                                    </TableCell>
                                    <TableCell>20 &#x20B3;</TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>
                    </TableContainer>


                </Stack>



            </Stack>

        </>
    )

}

export default DetailPage;