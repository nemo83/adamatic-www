import { Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Box, Pagination, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import RecurringPayment from "../lib/interfaces/RecurringPayment";
import TransactionUtil from "../lib/util/TransactionUtil";
import { useWallet } from "@meshsdk/react";
import { Address } from "@meshsdk/core-cst";
import { ADAMATIC_HOST, SCRIPT } from "../lib/util/Constants";
import dayjs from "dayjs";
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import UploadIcon from '@mui/icons-material/Upload';
import toast from "react-hot-toast";
import PaymentDetailsDialog from "./PaymentDetailsDialog";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ErrorIcon from '@mui/icons-material/Error';

export default function PaymentsTable(props: { version: number }) {

    const { version } = props;

    const { wallet, connected } = useWallet();

    const [recurringPaymentDTOs, setRecurringPaymentDTOs] = useState<RecurringPayment[]>([]);

    const [currentPageData, setCurrentPageData] = useState<RecurringPayment[]>([]);
    
    const [txHash, setTxHash] = useState<string | undefined>(undefined);

    const [outputIndex, setOutputIndex] = useState<number | undefined>(undefined);

    const [open, setOpen] = useState<boolean>(false);

    const [startIndex, setStartIndex] = useState<number>(0);
    const [endIndex, setEndIndex] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);

    useEffect(() => {
        if (connected) {
            reloadPayments();
        }
    }, [connected]);

    useEffect(() => {
        console.log('version: ' + version);
        reloadPayments();
    }, [version]);

    useEffect(() => {

        setCurrentPage(1); // Reset to first page when data reloads

        const totalPages = Math.ceil(recurringPaymentDTOs.length / itemsPerPage);
        setTotalPages(totalPages);

        const startIndex = (currentPage - 1) * itemsPerPage;
        setStartIndex(startIndex);

        const endIndex = startIndex + itemsPerPage;
        setEndIndex(endIndex);

        setCurrentPageData(recurringPaymentDTOs.slice(startIndex, endIndex));
    }, [recurringPaymentDTOs]);

    const reloadPayments = async () => {
        wallet
            .getUsedAddresses()
            .then((addresses) => {
                const address = Address.fromBech32(addresses[0])
                const paymentPubKeyHash = address.asBase()!.getPaymentCredential().hash.toString();
                return fetch(ADAMATIC_HOST + '/recurring_payments/public_key_hash/' + paymentPubKeyHash);
            })
            .then(response => response.json())
            .then((data: RecurringPayment[]) => {
                let recurringPaymentDTOs: RecurringPayment[] = [];
                data.forEach((recurringPayment: any) => {
                    recurringPaymentDTOs.push({
                        txHash: recurringPayment.tx_hash,
                        output_index: recurringPayment.output_index,
                        staking_address: recurringPayment.staking_address,
                        balance: recurringPayment.balance,
                        amountToSend: [],
                        payee: recurringPayment.payee,
                        startTime: dayjs(recurringPayment.start_time_timestamp),
                        endTime: undefined,
                        paymentIntervalHours: 0,
                        maxPaymentDelayHours: 0,
                        paymentStatus: recurringPayment.payment_status
                    });
                });
                setRecurringPaymentDTOs(recurringPaymentDTOs);
            })
    }

    const cancelRecurringPayment = async (recurringPaymentDTO: RecurringPayment) => {
        try {
            const unsignedTx = await TransactionUtil.getUnsignedCancelTx(recurringPaymentDTO, wallet);
            const signedTx = await wallet.signTx(unsignedTx);
            const txHash = await wallet.submitTx(signedTx);
            toast.success("Transaction submitted: " + txHash.substring(0, 10) + "..." + txHash.substring(txHash.length - 10), { duration: 5000 });
        } catch (error) {
            toast.error('' + error, { duration: 5000 })
        }
    }

    const openPaymentDetails = (txHash: string, outputIndex: number) => {
        console.log('calles outputIndex')
        setTxHash(txHash);
        setOutputIndex(outputIndex);
        setOpen(true);
    }

    const copyToClipboard = async (stakeAddress: string) => {
        navigator
            .clipboard
            .writeText(stakeAddress)
            .then(() => toast.success('Stake Address copied to Clipboard'));
    }

    const getStatus = (paymentStatus: string) => {
        switch (paymentStatus) {
            case "SCHEDULED":
                return (
                    <Tooltip title="Scheduled">
                        <ScheduleIcon />
                    </Tooltip>
                )
            case "COMPLETED":
                return (
                    <Tooltip title="Completed">
                        <CheckIcon />
                    </Tooltip>
                )
            case "WITHDRAWN":
                return (
                    <Tooltip title="Withdrawn">
                        <UploadIcon />
                    </Tooltip>
                )
            case "CANCELLED":
                return (
                    <Tooltip title="Cancelled">
                        <CancelIcon />
                    </Tooltip>
                )
            case "INSUFFICIENT_FUNDS":
                return (
                    <Tooltip title="Insufficient Funds">
                        <ErrorIcon />
                    </Tooltip>
                )
        }
    }

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        console.log('value: ' + value);
        setCurrentPage(value);
        
        const startIndex = (value - 1) * itemsPerPage;
        setStartIndex(startIndex);
        console.log('startIndex: ' + startIndex);

        const endIndex = startIndex + itemsPerPage;
        setEndIndex(endIndex);
        console.log('endIndex: ' + endIndex);

        setCurrentPageData(recurringPaymentDTOs.slice(startIndex, endIndex));
    };

    return (
        <>
            <PaymentDetailsDialog txHash={txHash} outputIndex={outputIndex} open={open} setOpen={setOpen} />
            {connected ?
                <TableContainer component={Paper}>
                    <Table aria-label="Payments Table">
                        <TableHead>
                            <TableRow>

                                <TableCell>View</TableCell>
                                <TableCell>Staking Address</TableCell>
                                <TableCell>Next run</TableCell>
                                <TableCell>Balance</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Cancel</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentPageData.map((row) => (
                                <TableRow
                                    key={row.txHash + row.output_index}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>

                                    <TableCell>
                                        <Tooltip title={"show payment details"}>
                                            <IconButton onClick={() => openPaymentDetails(row.txHash, row.output_index)}>
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                                        <IconButton onClick={() => copyToClipboard(row.staking_address)} >
                                            <ContentCopyIcon />
                                        </IconButton>
                                        <Button href={"https://cardanoscan.io/stakekey/" + row.staking_address}
                                            target="_blank"
                                            rel="noopener"
                                            endIcon={<LaunchIcon />}>
                                            {row.staking_address.substring(0, 10) + "..." + row.staking_address.substring(row.payee.length - 5)}
                                        </Button>
                                    </TableCell>
                                    <TableCell>{row.paymentStatus == 'SCHEDULED' ? row.startTime.format("YYYY-MM-DD HH:mm:ss") : "-"}</TableCell>
                                    <TableCell>{row.paymentStatus == 'SCHEDULED' || row.paymentStatus == 'INSUFFICIENT_FUNDS' ? (row.balance[0].amount / 1_000_000).toFixed(2) + ` ADA` : "-"}</TableCell>
                                    <TableCell>
                                        {getStatus(row.paymentStatus)}
                                    </TableCell>
                                    <TableCell>
                                        {row.paymentStatus == 'SCHEDULED' || row.paymentStatus == 'INSUFFICIENT_FUNDS' ?
                                            <IconButton aria-label="delete"
                                                onClick={() => cancelRecurringPayment(row)}>
                                                <DeleteIcon color="error" />
                                            </IconButton> : ""}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                : <></>}

            {connected && recurringPaymentDTOs.length > 0 && (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 2,
                    px: 2
                }}>
                    <Typography variant="body2" color="text.secondary">
                        Showing {startIndex + 1}-{Math.min(endIndex, recurringPaymentDTOs.length)} of {recurringPaymentDTOs.length} payments
                    </Typography>

                    {totalPages > 1 && (
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            showFirstButton
                            showLastButton
                            siblingCount={1}
                            boundaryCount={1}
                        />
                    )}
                </Box>
            )}
        </>
    );
}