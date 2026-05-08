import { Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Box, Pagination, Typography, Checkbox } from "@mui/material";
import React, { useEffect, useState } from "react";
import type { RecurringPayment } from "../../../types/RecurringPayment";
import { useWallet } from "../../../lib/wallet/useWallet";
import { getChainAdapter } from "../../../lib/cardano/factory";
import { useScriptByName } from "../../../lib/cardano/ScriptContext";
import { fetchRecurringPaymentsByPkh } from "../../../lib/api/adamatic";
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

    const { wallet, connected, address: walletAddress } = useWallet();

    const chainAdapter = getChainAdapter();
    const automaticPayments = useScriptByName("automatic_payments");

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

    const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());

    // Trigger on `walletAddress`, not `connected` — `connected` flips true
    // a tick before the bech32 address resolves on auto-reconnect, so a
    // `connected`-only effect would fire with `walletAddress === null` and
    // bail out before the manifest catches up.
    useEffect(() => {
        if (walletAddress) {
            reloadPayments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletAddress, version]);

    useEffect(() => {
        // Reset to first page when data reloads. Slice off page 1 directly
        // — don't read stale `currentPage` from the closure.
        setCurrentPage(1);
        setStartIndex(0);
        setEndIndex(itemsPerPage);
        setTotalPages(Math.ceil(recurringPaymentDTOs.length / itemsPerPage));
        setCurrentPageData(recurringPaymentDTOs.slice(0, itemsPerPage));
    }, [recurringPaymentDTOs, itemsPerPage]);

    const reloadPayments = async () => {
        if (!walletAddress) return;
        const parsed = chainAdapter.parseAddress(walletAddress);
        if (!parsed.isValid) return;
        const data = await fetchRecurringPaymentsByPkh(parsed.paymentCredentialHash);
        const dtos: RecurringPayment[] = data.map((rp: any) => ({
            txHash: rp.tx_hash,
            output_index: rp.output_index,
            staking_address: rp.staking_address,
            balance: rp.balance,
            amountToSend: [],
            payee: rp.payee,
            startTime: dayjs(rp.start_time_timestamp),
            endTime: undefined,
            paymentIntervalHours: 0,
            maxPaymentDelayHours: 0,
            paymentStatus: rp.payment_status,
        }));
        setRecurringPaymentDTOs(dtos);
    }

    const buildCancelCtx = (payments: RecurringPayment[]) => {
        if (!automaticPayments?.finalHash) {
            throw new Error("Scripts manifest not loaded yet. Please retry shortly.");
        }
        return {
            wallet,
            payments,
            scriptHash: automaticPayments.finalHash,
            scriptRawCode: automaticPayments.rawCompiledCode,
            scriptParameters: automaticPayments.parameters,
            scriptVersion: automaticPayments.plutusVersion,
        };
    }

    const cancelRecurringPayment = async (recurringPaymentDTO: RecurringPayment) => {
        try {
            const txHash = await chainAdapter.buildAndSubmitCancelTx(buildCancelCtx([recurringPaymentDTO]));
            toast.success("Transaction submitted: " + txHash.substring(0, 10) + "..." + txHash.substring(txHash.length - 10), { duration: 5000 });
        } catch (error) {
            toast.error('' + error, { duration: 5000 })
        }
    }

    const bulkCancelRecurringPayments = async () => {

        const paymentsToCancel = recurringPaymentDTOs.filter(payment =>
            selectedPayments.has(payment.txHash + payment.output_index)
        );

        try {
            const txHash = await chainAdapter.buildAndSubmitCancelTx(buildCancelCtx(paymentsToCancel));
            toast.success(`Payment cancelled: ${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 10)}`, { duration: 3000 });

            setSelectedPayments(new Set());
            toast.success(`Successfully cancelled ${paymentsToCancel.length} payments`, { duration: 5000 });
        } catch (error) {
            toast.error('Error cancelling payments: ' + error, { duration: 5000 });
        }
    }

    const handleSelectPayment = (paymentId: string) => {
        const newSelected = new Set(selectedPayments);
        if (newSelected.has(paymentId)) {
            newSelected.delete(paymentId);
        } else {
            newSelected.add(paymentId);
        }
        setSelectedPayments(newSelected);
    }

    const handleSelectAll = () => {
        const selectablePayments = currentPageData.filter(payment => 
            payment.paymentStatus === 'SCHEDULED' || payment.paymentStatus === 'INSUFFICIENT_FUNDS'
        );

        if (selectedPayments.size === selectablePayments.length) {
            setSelectedPayments(new Set());
        } else {
            const newSelected = new Set<string>();
            selectablePayments.forEach(payment => {
                newSelected.add(payment.txHash + payment.output_index);
            });
            setSelectedPayments(newSelected);
        }
    }

    const openPaymentDetails = (txHash: string, outputIndex: number) => {
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

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
        const startIndex = (value - 1) * itemsPerPage;
        setStartIndex(startIndex);
        const endIndex = startIndex + itemsPerPage;
        setEndIndex(endIndex);
        setCurrentPageData(recurringPaymentDTOs.slice(startIndex, endIndex));
    };

    const selectablePayments = currentPageData.filter(payment => 
        payment.paymentStatus === 'SCHEDULED' || payment.paymentStatus === 'INSUFFICIENT_FUNDS'
    );

    return (
        <>
            <PaymentDetailsDialog txHash={txHash} outputIndex={outputIndex} open={open} setOpen={setOpen} />
            {connected ?
                <>
                    {selectedPayments.size > 0 && (
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">
                                {selectedPayments.size} payment(s) selected
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="error" 
                                onClick={bulkCancelRecurringPayments}
                                startIcon={<DeleteIcon />}
                            >
                                Cancel Selected Payments
                            </Button>
                        </Box>
                    )}
                    <TableContainer component={Paper}>
                        <Table aria-label="Payments Table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Checkbox
                                            indeterminate={selectedPayments.size > 0 && selectedPayments.size < selectablePayments.length}
                                            checked={selectablePayments.length > 0 && selectedPayments.size === selectablePayments.length}
                                            onChange={handleSelectAll}
                                            disabled={selectablePayments.length === 0}
                                        />
                                    </TableCell>
                                    <TableCell>View</TableCell>
                                    <TableCell>Staking Address</TableCell>
                                    <TableCell>Next run</TableCell>
                                    <TableCell>Balance</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Cancel</TableCell>
                                </TableRow>
                            </TableHead>
                        <TableBody>
                            {currentPageData.map((row) => {
                                const paymentId = row.txHash + row.output_index;
                                const isSelectable = row.paymentStatus === 'SCHEDULED' || row.paymentStatus === 'INSUFFICIENT_FUNDS';
                                
                                return (
                                    <TableRow
                                        key={paymentId}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>

                                        <TableCell>
                                            <Checkbox
                                                checked={selectedPayments.has(paymentId)}
                                                onChange={() => handleSelectPayment(paymentId)}
                                                disabled={!isSelectable}
                                            />
                                        </TableCell>
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
                                            {row.staking_address.substring(0, 10) + "..." + row.staking_address.substring(row.staking_address.length - 5)}
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
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                </>
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