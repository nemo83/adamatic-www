/**
 * Payment-mode discriminated union. Replaces the `isHoskyInput` boolean
 * scattered across the form components. Adding a new mode (e.g. "subscription"
 * or a multi-asset generic mode) becomes a type-checked exhaustiveness check.
 */
export type PaymentMode = "hosky" | "generic";
