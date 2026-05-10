/**
 * Compact horizontal strip surfacing the operator fee above the
 * PaymentForm. After the beta caps were lifted, this is the only
 * remaining "guardrail" worth showing upfront — kept here so first-time
 * users see the fee before they fill the form.
 *
 * Neutral palette (slate, not amber) since this is informational, not a
 * cap warning.
 */
import React from "react";
import { Box, Stack, Typography, Tooltip } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useTranslations } from "../../../lib/i18n/I18nProvider";

export interface LimitsStripProps {
    /** Operator fee in ADA. Pass `null` while loading from BE. */
    protocolFeeAda: number | null;
}

export default function LimitsStrip({ protocolFeeAda }: LimitsStripProps) {
    const t = useTranslations();
    return (
        <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            justifyContent="flex-end"
            sx={{ mb: 2.5 }}
        >
            <Tooltip title={t("limits.tooltips.protocolFee")} arrow>
                <Box
                    sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        height: 26,
                        px: 1.25,
                        borderRadius: 999,
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                        fontFamily: '"DM Sans", system-ui, sans-serif',
                        fontSize: 11.5,
                        color: "text.secondary",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        "& svg": { color: "text.secondary" },
                    }}
                >
                    <AttachMoneyIcon sx={{ fontSize: 14 }} />
                    <Typography component="span" sx={{ font: "inherit" }}>
                        {protocolFeeAda !== null
                            ? t("limits.protocolFee", { ada: protocolFeeAda })
                            : t("limits.protocolFeeLoading")}
                    </Typography>
                </Box>
            </Tooltip>
        </Stack>
    );
}
