import { Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Box, Pagination, Typography, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Add } from "@mui/icons-material";
import NextLink from "next/link";
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
import { useTranslations } from "../../../lib/i18n/I18nProvider";
import { formatWalletError, isUserDeclinedError } from "../../../lib/wallet/errors";
import { explorerUrl } from "../../../lib/cardano/explorer";

export default function PaymentsTable(props: { version: number }) {

    const { version } = props;

    const t = useTranslations();
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

    const [hasFetched, setHasFetched] = useState<boolean>(false);

    // The pending-cancel set; non-null means the confirm dialog is open.
    // null = closed; [] = (shouldn't happen); [...payments] = waiting for confirm.
    const [pendingCancel, setPendingCancel] = useState<RecurringPayment[] | null>(null);

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
        setHasFetched(true);
    }

    const buildCancelCtx = (payments: RecurringPayment[]) => {
        if (!automaticPayments?.finalHash) {
            throw new Error(t("tx.scriptsNotLoaded"));
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

    const shortHash = (h: string) => h.substring(0, 10) + "..." + h.substring(h.length - 10);

    const requestCancel = (recurringPaymentDTO: RecurringPayment) => {
        setPendingCancel([recurringPaymentDTO]);
    };

    const requestBulkCancel = () => {
        const paymentsToCancel = recurringPaymentDTOs.filter(payment =>
            selectedPayments.has(payment.txHash + payment.output_index)
        );
        if (paymentsToCancel.length === 0) return;
        setPendingCancel(paymentsToCancel);
    };

    const runCancel = async () => {
        if (!pendingCancel || pendingCancel.length === 0) return;
        const isBulk = pendingCancel.length > 1;
        const payments = pendingCancel;
        setPendingCancel(null);
        try {
            const txHash = await chainAdapter.buildAndSubmitCancelTx(buildCancelCtx(payments));
            if (isBulk) {
                toast.success(t("payments.toast.paymentCancelled", { hash: shortHash(txHash) }), { duration: 3000 });
                setSelectedPayments(new Set());
                toast.success(t("payments.toast.bulkCancelled", { n: payments.length }), { duration: 5000 });
            } else {
                toast.success(t("payments.toast.txSubmitted", { hash: shortHash(txHash) }), { duration: 5000 });
            }
        } catch (error) {
            if (isUserDeclinedError(error)) {
                toast.error(t("tx.userCancelled"), { duration: 5000 });
            } else if (isBulk) {
                toast.error(t("payments.toast.cancelError", { error: formatWalletError(error, t) }), { duration: 5000 });
            } else {
                toast.error(formatWalletError(error, t), { duration: 5000 });
            }
        }
    };

    const totalRefundLovelace = pendingCancel
        ? pendingCancel.reduce((sum, p) => sum + (p.balance?.[0]?.amount ?? 0), 0)
        : 0;
    const totalRefundAda = (totalRefundLovelace / 1_000_000).toFixed(2);

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
            .then(() => toast.success(t("payments.toast.stakeAddressCopied")));
    }

    const getStatus = (paymentStatus: string) => {
        switch (paymentStatus) {
            case "SCHEDULED":
                return (
                    <Tooltip title={t("payments.status.scheduled")}>
                        <ScheduleIcon />
                    </Tooltip>
                )
            case "COMPLETED":
                return (
                    <Tooltip title={t("payments.status.completed")}>
                        <CheckIcon />
                    </Tooltip>
                )
            case "WITHDRAWN":
                return (
                    <Tooltip title={t("payments.status.withdrawn")}>
                        <UploadIcon />
                    </Tooltip>
                )
            case "CANCELLED":
                return (
                    <Tooltip title={t("payments.status.cancelled")}>
                        <CancelIcon />
                    </Tooltip>
                )
            case "INSUFFICIENT_FUNDS":
                return (
                    <Tooltip title={t("payments.status.insufficientFunds")}>
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
            {connected && hasFetched && recurringPaymentDTOs.length === 0 ? (
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                        px: 2,
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {t('payments.empty.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 420, mx: 'auto' }}>
                        {t('payments.empty.body')}
                    </Typography>
                    <NextLink href="/" passHref legacyBehavior>
                        <Button
                            component="a"
                            variant="contained"
                            startIcon={<Add />}
                            sx={{
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                borderRadius: '12px',
                                fontWeight: 600,
                                textTransform: 'none',
                                px: 2.5,
                                py: 1,
                                '&, &:link, &:visited, &:hover, &:active': { color: 'white' },
                            }}
                        >
                            {t('payments.empty.cta')}
                        </Button>
                    </NextLink>
                </Box>
            ) : connected ?
                <>
                    {selectedPayments.size > 0 && (
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">
                                {t("payments.selectedCount", { n: selectedPayments.size })}
                            </Typography>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={requestBulkCancel}
                                startIcon={<DeleteIcon />}
                            >
                                {t("payments.cancelSelected")}
                            </Button>
                        </Box>
                    )}
                    <TableContainer component={Paper}>
                        <Table aria-label={t("payments.tableAria")}>
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
                                    <TableCell>{t("payments.headers.view")}</TableCell>
                                    <TableCell>{t("payments.headers.stakingAddress")}</TableCell>
                                    <TableCell>{t("payments.headers.nextRun")}</TableCell>
                                    <TableCell>{t("payments.headers.balance")}</TableCell>
                                    <TableCell>{t("payments.headers.status")}</TableCell>
                                    <TableCell>{t("payments.headers.cancel")}</TableCell>
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
                                        <Tooltip title={t("payments.showDetails")}>
                                            <IconButton onClick={() => openPaymentDetails(row.txHash, row.output_index)}>
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                                        <IconButton onClick={() => copyToClipboard(row.staking_address)} >
                                            <ContentCopyIcon />
                                        </IconButton>
                                        <Button href={explorerUrl.stake(row.staking_address)}
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
                                            <IconButton aria-label={t("payments.deleteAria")}
                                                onClick={() => requestCancel(row)}>
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
                        {t("payments.showing", {
                            start: startIndex + 1,
                            end: Math.min(endIndex, recurringPaymentDTOs.length),
                            total: recurringPaymentDTOs.length,
                        })}
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

            <Dialog
                open={pendingCancel !== null}
                onClose={() => setPendingCancel(null)}
                aria-labelledby="cancel-confirm-title"
            >
                <DialogTitle id="cancel-confirm-title">
                    {pendingCancel && pendingCancel.length > 1
                        ? t("payments.confirm.titleBulk", { n: pendingCancel.length })
                        : t("payments.confirm.title")}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {pendingCancel && pendingCancel.length > 1
                            ? t("payments.confirm.bodyBulk", { n: pendingCancel.length, ada: totalRefundAda })
                            : t("payments.confirm.body", { ada: totalRefundAda })}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPendingCancel(null)}>
                        {t("payments.confirm.dismiss")}
                    </Button>
                    <Button
                        onClick={runCancel}
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                    >
                        {t("payments.confirm.confirm")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}