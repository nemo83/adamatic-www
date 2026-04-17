import type { Dayjs } from "dayjs";
import type AssetAmount from "../../interfaces/AssetAmount";
import type RecurringPaymentDatum from "../../interfaces/RecurringPaymentDatum";

export interface WalletRow {
    address: string;
    status:
        | "empty"
        | "validating"
        | "valid"
        | "invalid"
        | "not-delegated";
    message?: string;
}

export interface PaymentSetupState {
    /** Currently selected mode — drives which fields the BE controls vs user. */
    mode: "hosky" | "generic";

    // Wallets that will fund the schedule (one UTxO per wallet).
    walletFromList: string[];
    walletRows: WalletRow[];
    isDelegatedToHosky: boolean;

    // The form's "datum-shaped" fields.
    payee: string;
    amountToSend: AssetAmount[];
    maxFeesLovelace: number;
    startTime: Dayjs | null;
    endTime: Dayjs | null;
    paymentIntervalHours: number;
    paymentIntervalEpochs: number;
    lockEndTime: boolean;
    epochStart: number;
    epochEnd: number;
    numPulls: number;

    // Per-wallet lovelace deposit (BE suggests, user may override later).
    deposit: number;

    // Consent gates on the review step.
    acceptRisk: boolean;
    acceptFees: boolean;

    // BE settings (protocol fees etc). null while in flight / BE down.
    settings: { operator_fee_lovelace: number; base_fee_lovelace: number } | null;
}

export interface PaymentSetupDerived {
    datumDTO: RecurringPaymentDatum;
    /** Amount per payment in lovelace (for ADA) or native units. */
    amountPerPayment: number;
    /** Total number of payments that will fire across all wallets. */
    numPayments: number;
    /** Whether the form is valid enough to submit. */
    isSubmittable: boolean;
    /** Short human-readable reason the form is NOT submittable, if any. */
    blockReason: string | null;
}
