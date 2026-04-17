/**
 * ScheduleDetailsDialog — fetches a recurring payment's record + event log
 * from the backend and renders it in the Ledger-styled PaymentDetailsDialog.
 */
import React, { useEffect, useState } from "react";
import {
    PaymentDetailsDialog,
    type PaymentDetails as DialogDetails,
    type TxEventType,
} from "../../../design/components/PaymentDetailsDialog";
import { ADAMATIC_HOST } from "../../util/Constants";
import type {
    PaymentDetails as BackendDetails,
    TransactionDetail,
} from "../../interfaces/AdaMaticTypes";

export interface ScheduleDetailsDialogProps {
    open: boolean;
    txHash?: string;
    outputIndex?: number;
    onClose: () => void;
}

const TYPE_MAP: Record<string, TxEventType> = {
    CREATED: "CREATED",
    SCHEDULED: "SCHEDULED",
    PAYMENT_EXECUTED: "PAYMENT_EXECUTED",
    WITHDRAWN: "WITHDRAWN",
    COMPLETED: "COMPLETED",
};

function mapToDialogShape(be: BackendDetails): DialogDetails {
    return {
        from: be.from,
        to: be.to,
        amountLovelace: be.amount?.amount ?? 0,
        asset: be.amount?.assetName || "ADA",
        numPulls: be.num_pulls,
        epochInterval: be.epoch_interval,
        initialDepositLovelace: be.initial_deposit?.amount ?? 0,
        maxFeeLovelace: be.max_fee,
        epochStart: be.epoch_start,
        epochEnd: be.epoch_end,
        events: (be.transactions ?? []).map((t: TransactionDetail) => ({
            timestamp: t.timestamp,
            type: TYPE_MAP[t.transaction_type] ?? "CREATED",
            txHash: t.tx_hash,
            balanceLovelace: t.balance?.amount ?? 0,
        })),
    };
}

export const ScheduleDetailsDialog: React.FC<ScheduleDetailsDialogProps> = ({
    open,
    txHash,
    outputIndex,
    onClose,
}) => {
    const [details, setDetails] = useState<DialogDetails | undefined>(undefined);

    useEffect(() => {
        if (!open || !txHash || outputIndex === undefined) {
            setDetails(undefined);
            return;
        }
        let cancelled = false;
        const qs = new URLSearchParams({
            tx_hash: txHash,
            output_index: String(outputIndex),
        });
        fetch(ADAMATIC_HOST + "/recurring_payments/details?" + qs.toString())
            .then((r) => (r.ok ? r.json() : null))
            .then((data: BackendDetails | null) => {
                if (cancelled) return;
                setDetails(data ? mapToDialogShape(data) : undefined);
            })
            .catch((err) => {
                console.warn("Schedule details fetch failed:", err);
            });
        return () => {
            cancelled = true;
        };
    }, [open, txHash, outputIndex]);

    return (
        <PaymentDetailsDialog
            open={open}
            onClose={onClose}
            details={details}
        />
    );
};
