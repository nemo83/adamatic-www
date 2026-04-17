export type AssetUnit = "ADA" | "USDM" | "DJED" | "SNEK" | "HOSKY";

export interface WalletRow {
  address: string;
  status: "empty" | "valid" | "invalid" | "validating" | "not-delegated";
  message?: string;
}

export interface PaymentFormValue {
  payee: string;
  asset: AssetUnit;
  amount: string;
  wallets: WalletRow[];
  startTime: string;
  endTime: string | null;
  frequencyEpochs: number;
  maxFeeAda: string;
  acceptRisk: boolean;
  acceptFees: boolean;
}

export interface StepProps {
  mode: "hosky" | "generic";
  value: PaymentFormValue;
  onChange: (next: PaymentFormValue) => void;
}
