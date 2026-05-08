/**
 * Compact horizontal strip showing the current beta limits + the protocol
 * fee. Sits above the PaymentForm. Three pill chips with leading icons,
 * amber-tinted to signal "guardrails / be careful".
 */
import React from "react";
import { Box, Stack, Typography, Tooltip } from "@mui/material";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { MAX_PULLS, MAX_WALLETS } from "../limits";
import { useTranslations } from "../../../lib/i18n/I18nProvider";

export interface LimitsStripProps {
    /** Operator fee in ADA. Pass `null` while loading from BE. */
    protocolFeeAda: number | null;
}

export default function LimitsStrip({ protocolFeeAda }: LimitsStripProps) {
    const t = useTranslations();
    return (
        <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{
                p: 1,
                borderRadius: 2,
                border: "1px solid #FDE68A",
                bgcolor: "#FFFBEB",
                mb: 2.5,
                alignItems: { xs: "stretch", sm: "center" },
                justifyContent: "space-between",
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                sx={{ pl: 0.75 }}
            >
                <ShieldOutlinedIcon sx={{ color: "#B45309", fontSize: 18 }} />
                <Typography
                    variant="caption"
                    sx={{
                        color: "#78350F",
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        fontSize: 10.5,
                    }}
                >
                    {t("limits.label")}
                </Typography>
            </Stack>
            <Stack
                direction="row"
                spacing={0.75}
                flexWrap="wrap"
                useFlexGap
                sx={{ rowGap: 0.5 }}
            >
                <Pill
                    icon={<RefreshIcon sx={{ fontSize: 14 }} />}
                    label={t("limits.maxPulls", { n: MAX_PULLS })}
                    tooltip={t("limits.tooltips.maxPulls")}
                />
                <Pill
                    icon={
                        <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 14 }} />
                    }
                    label={t("limits.maxWallets", { n: MAX_WALLETS })}
                    tooltip={t("limits.tooltips.maxWallets")}
                />
                <Pill
                    icon={<AttachMoneyIcon sx={{ fontSize: 14 }} />}
                    label={
                        protocolFeeAda !== null
                            ? t("limits.protocolFee", { ada: protocolFeeAda })
                            : t("limits.protocolFeeLoading")
                    }
                    tooltip={t("limits.tooltips.protocolFee")}
                />
            </Stack>
        </Stack>
    );
}

function Pill({
    icon,
    label,
    tooltip,
}: {
    icon?: React.ReactNode;
    label: string;
    tooltip?: string;
}) {
    const inner = (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                height: 26,
                px: 1.25,
                borderRadius: 999,
                bgcolor: "white",
                border: "1px solid #FDE68A",
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontSize: 11.5,
                color: "#78350F",
                fontWeight: 600,
                whiteSpace: "nowrap",
                "& svg": { color: "#B45309" },
            }}
        >
            {icon}
            <span>{label}</span>
        </Box>
    );
    return tooltip ? (
        <Tooltip title={tooltip} arrow>
            {inner}
        </Tooltip>
    ) : (
        inner
    );
}
