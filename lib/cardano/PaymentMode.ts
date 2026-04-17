/**
 * Payment mode — distinguishes the fixed Hosky Doggie Bowl flow from the
 * generic recurring-payment flow. Was previously a `isHoskyInput: boolean`
 * prop threaded through the form; this replaces it with a discriminated
 * string union so new modes can be added without boolean explosion.
 */
export type PaymentMode = "hosky" | "generic";

export const isHosky = (mode: PaymentMode): mode is "hosky" => mode === "hosky";
export const isGeneric = (mode: PaymentMode): mode is "generic" => mode === "generic";
