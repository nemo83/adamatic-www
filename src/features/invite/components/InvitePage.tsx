/**
 * Invite landing page — rugpool operators share /invite/{ticker|hex|bech32}
 * to onboard delegators. The page renders pool branding from our curated
 * list, lets the visitor connect their wallet, then estimates how much
 * extra HOSKY they'd earn at this pool's current rate (× CoinGecko's
 * HOSKY/USD).
 *
 * Visual style follows the rest of the app — MUI v6 + the existing blue
 * gradient palette, no broadsheet aesthetic.
 */
import React, { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Stack,
    Typography,
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import GroupsIcon from "@mui/icons-material/Groups";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import PercentIcon from "@mui/icons-material/Percent";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import toast from "react-hot-toast";
import type { CuratedPool } from "../../../lib/cardano/curatedPools";
import { useWallet } from "../../../lib/wallet/useWallet";
import { WalletButton } from "../../../lib/wallet/WalletButton";
import { useTranslations } from "../../../lib/i18n/I18nProvider";
import { getChainAdapter } from "../../../lib/cardano/factory";
import { fetchHoskyPriceUsd } from "../../../lib/api/coingecko";
import { fetchControlledBalance } from "../../../lib/wallet/balance";
import { trackDelegationFlow } from "../../delegation/hooks/useDelegationTracking";
import { isUserDeclinedError } from "../../../lib/wallet/errors";
import { Address, RewardAccount } from "@evolution-sdk/evolution";

const EPOCHS_PER_MONTH = 6; // 5-day epochs ≈ 6/month
const EPOCHS_PER_YEAR = 73;

/** Compact format with k/M/B suffix. */
function fmtCompact(n: number): string {
    if (!isFinite(n)) return "—";
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(2)}k`;
    return n.toFixed(0);
}

function fmtUsd(n: number | null): string {
    if (n === null || !isFinite(n)) return "—";
    if (n >= 100) return `$${n.toFixed(0)}`;
    if (n >= 1) return `$${n.toFixed(2)}`;
    return `$${n.toFixed(3)}`;
}

function fmtAda(lovelace: bigint): string {
    const ada = Number(lovelace) / 1_000_000;
    return ada.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function shortBech32(s: string): string {
    return s.length <= 16 ? s : `${s.slice(0, 10)}…${s.slice(-6)}`;
}

export default function InvitePage({ pool }: { pool: CuratedPool }) {
    const t = useTranslations();
    const { wallet, connected, address: walletAddress } = useWallet();

    const [hoskyPriceUsd, setHoskyPriceUsd] = useState<number | null>(null);
    const [adaBalance, setAdaBalance] = useState<bigint | null>(null);
    const [delegating, setDelegating] = useState(false);

    // Fetch HOSKY price on mount.
    useEffect(() => {
        fetchHoskyPriceUsd().then(setHoskyPriceUsd);
    }, []);

    // Fetch the wallet's controlled ADA when connected.
    useEffect(() => {
        if (!walletAddress) {
            setAdaBalance(null);
            return;
        }
        try {
            const addr = Address.fromBech32(walletAddress);
            if (!addr.stakingCredential) {
                setAdaBalance(0n);
                return;
            }
            const reward = new RewardAccount.RewardAccount({
                networkId: addr.networkId,
                stakeCredential: addr.stakingCredential,
            });
            const rewardBech32 = RewardAccount.toBech32(reward);
            fetchControlledBalance(rewardBech32).then((b) => {
                setAdaBalance(b ? b.lovelace : null);
            });
        } catch {
            setAdaBalance(null);
        }
    }, [walletAddress]);

    // Earnings calculation
    const earnings = useMemo(() => {
        if (adaBalance === null) return null;
        const ada = Number(adaBalance) / 1_000_000;
        const hoskyPerEpoch = ada * pool.hoskyada;
        const hoskyPerMonth = hoskyPerEpoch * EPOCHS_PER_MONTH;
        const hoskyPerYear = hoskyPerEpoch * EPOCHS_PER_YEAR;
        const usdPerEpoch =
            hoskyPriceUsd !== null ? hoskyPerEpoch * hoskyPriceUsd : null;
        const usdPerMonth =
            hoskyPriceUsd !== null ? hoskyPerMonth * hoskyPriceUsd : null;
        const usdPerYear =
            hoskyPriceUsd !== null ? hoskyPerYear * hoskyPriceUsd : null;
        return {
            ada,
            hoskyPerEpoch,
            hoskyPerMonth,
            hoskyPerYear,
            usdPerEpoch,
            usdPerMonth,
            usdPerYear,
        };
    }, [adaBalance, pool.hoskyada, hoskyPriceUsd]);

    const oversaturated =
        typeof pool.liveSaturation === "number" && pool.liveSaturation > 0.85;

    const handleDelegate = async () => {
        if (!connected || !wallet || !walletAddress) {
            toast.error(t("wallet.connectFirst"));
            return;
        }
        setDelegating(true);
        const FLOW_TOAST = "delegation-flow";
        toast.loading(t("delegate.building"), { id: FLOW_TOAST });
        try {
            const adapter = getChainAdapter();
            const txHash = await adapter.buildAndSubmitDelegateTx({
                wallet,
                poolBech32: pool.poolId,
            });
            trackDelegationFlow({
                txHash,
                walletAddress,
                toastId: FLOW_TOAST,
                t,
            });
        } catch (err) {
            if (isUserDeclinedError(err)) {
                toast.error(t("tx.userCancelled"), { id: FLOW_TOAST, duration: 5000 });
            } else {
                toast.error(t("delegate.failed", { error: String(err) }), {
                    id: FLOW_TOAST,
                    duration: 6000,
                });
            }
        } finally {
            setDelegating(false);
        }
    };

    return (
        <Box
            sx={(theme) => ({
                width: "100%",
                minHeight: "calc(100vh - 80px)",
                backgroundRepeat: "no-repeat",
                backgroundImage:
                    "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 70%), transparent)",
                ...theme.applyStyles("dark", {
                    backgroundImage:
                        "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
                }),
                pb: 6,
            })}
        >
            <Stack
                spacing={3}
                sx={{
                    alignItems: "center",
                    pt: { xs: 12, sm: 14 },
                    px: { xs: 2, sm: 4 },
                }}
            >
                {/* Eyebrow */}
                <Chip
                    label={t("invite.eyebrow")}
                    color="primary"
                    size="small"
                    sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.18em",
                        fontWeight: 700,
                        fontSize: 11,
                    }}
                />

                {/* Hero: pool logo + name */}
                <Stack alignItems="center" spacing={1.5} sx={{ maxWidth: 720, width: "100%" }}>
                    <Avatar
                        src={pool.iconUrl}
                        alt={pool.ticker}
                        sx={{
                            width: { xs: 80, sm: 96 },
                            height: { xs: 80, sm: 96 },
                            bgcolor: "primary.light",
                            color: "primary.contrastText",
                            fontSize: 32,
                            fontWeight: 700,
                            boxShadow: "0 8px 24px -10px rgba(33,150,243,0.45)",
                            border: "2px solid white",
                        }}
                    >
                        {pool.ticker.slice(0, 1)}
                    </Avatar>
                    <Typography
                        component="h1"
                        sx={{
                            fontSize: { xs: 36, sm: 48 },
                            fontWeight: 800,
                            lineHeight: 1.1,
                            letterSpacing: "-0.02em",
                            textAlign: "center",
                        }}
                    >
                        {pool.ticker}
                    </Typography>
                    {pool.name && pool.name !== pool.ticker && (
                        <Typography
                            sx={{
                                fontSize: { xs: 16, sm: 18 },
                                color: "text.secondary",
                                fontWeight: 500,
                                textAlign: "center",
                            }}
                        >
                            {pool.name}
                        </Typography>
                    )}
                    {pool.description && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                textAlign: "center",
                                maxWidth: 540,
                                mt: 1,
                            }}
                        >
                            {pool.description}
                        </Typography>
                    )}
                    {pool.homepage && (
                        <Button
                            href={pool.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            endIcon={<LaunchIcon fontSize="small" />}
                            sx={{
                                textTransform: "none",
                                color: "primary.main",
                                "&, &:link, &:visited, &:hover, &:active": { color: "primary.main" },
                            }}
                        >
                            {pool.homepage.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </Button>
                    )}
                </Stack>

                {/* Stats card */}
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: 720,
                        mt: 1,
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: "0 6px 24px -16px rgba(0,0,0,0.12)",
                    }}
                >
                    <Typography
                        variant="overline"
                        sx={{ letterSpacing: "0.16em", color: "text.secondary", fontWeight: 700 }}
                    >
                        {t("invite.statsTitle")}
                    </Typography>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        sx={{ mt: 1.5, alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between" }}
                    >
                        <Box>
                            <Typography
                                sx={{
                                    fontSize: { xs: 28, sm: 34 },
                                    fontWeight: 800,
                                    lineHeight: 1,
                                    fontFeatureSettings: '"tnum" 1',
                                    background: "linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)",
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                {pool.hoskyada.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
                                {t("invite.hoskyPerAdaPerEpoch")}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
                            <Chip
                                icon={<WaterDropIcon />}
                                label={t("invite.saturationChip", { pct: ((pool.liveSaturation ?? 0) * 100).toFixed(1) })}
                                size="small"
                                color={oversaturated ? "warning" : "default"}
                                variant="outlined"
                            />
                            <Chip
                                icon={<PercentIcon />}
                                label={t("invite.feeChip", { pct: ((pool.marginCost ?? 0) * 100).toFixed(2) })}
                                size="small"
                                variant="outlined"
                            />
                            <Chip
                                icon={<GroupsIcon />}
                                label={t("invite.delegatorsChip", { n: (pool.liveDelegators ?? 0).toLocaleString() })}
                                size="small"
                                variant="outlined"
                            />
                        </Stack>
                    </Stack>
                    {oversaturated && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            {t("invite.nearSaturation")}
                        </Alert>
                    )}
                </Box>

                {/* Earnings card */}
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: 720,
                        p: { xs: 2.5, sm: 3.5 },
                        borderRadius: 3,
                        background:
                            "linear-gradient(135deg, rgba(33,150,243,0.08) 0%, rgba(255,107,53,0.06) 100%)",
                        border: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                        <LocalFireDepartmentIcon sx={{ color: "#B45309" }} />
                        <Typography variant="overline" sx={{ letterSpacing: "0.16em", fontWeight: 700, color: "text.secondary" }}>
                            {t("invite.earningsTitle")}
                        </Typography>
                    </Stack>

                    {!connected ? (
                        <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
                            <Typography variant="body1" sx={{ textAlign: "center", color: "text.secondary" }}>
                                {t("invite.connectPrompt", { ticker: pool.ticker })}
                            </Typography>
                            <WalletButton />
                        </Stack>
                    ) : adaBalance === null ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                            {t("invite.calculating")}
                        </Typography>
                    ) : adaBalance === 0n ? (
                        <Stack spacing={1.5} sx={{ py: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {t("invite.zeroBalance")}
                            </Typography>
                        </Stack>
                    ) : earnings ? (
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
                                    {t("invite.youHold")}
                                </Typography>
                                <Typography sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1 }}>
                                    {fmtAda(adaBalance)} ADA
                                </Typography>
                            </Box>

                            <Divider />

                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={{ xs: 2, sm: 1 }}
                                sx={{ justifyContent: "space-between" }}
                            >
                                <HorizonCell
                                    label={t("invite.perEpoch")}
                                    hosky={fmtCompact(earnings.hoskyPerEpoch)}
                                    usd={fmtUsd(earnings.usdPerEpoch)}
                                />
                                <HorizonCell
                                    label={t("invite.perMonth")}
                                    hosky={fmtCompact(earnings.hoskyPerMonth)}
                                    usd={fmtUsd(earnings.usdPerMonth)}
                                />
                                <HorizonCell
                                    label={t("invite.perYear")}
                                    hosky={fmtCompact(earnings.hoskyPerYear)}
                                    usd={fmtUsd(earnings.usdPerYear)}
                                    highlight
                                />
                            </Stack>

                            {earnings.usdPerYear !== null && earnings.usdPerYear > 0.01 && (
                                <Alert
                                    icon={<LocalFireDepartmentIcon />}
                                    severity="success"
                                    sx={{ "& .MuiAlert-message": { fontWeight: 600 } }}
                                >
                                    {t("invite.estimateLine", { usd: fmtUsd(earnings.usdPerYear) })}
                                </Alert>
                            )}

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ pt: 1 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleDelegate}
                                    disabled={delegating}
                                    sx={{
                                        flex: 1,
                                        background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                                        textTransform: "none",
                                        fontWeight: 700,
                                        fontSize: "1.05rem",
                                        py: 1.5,
                                        borderRadius: 2,
                                        boxShadow: "0 4px 15px 0 rgba(33, 150, 243, 0.3)",
                                        "&:hover": {
                                            background: "linear-gradient(45deg, #1976d2 30%, #1976d2 90%)",
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 6px 20px 0 rgba(33, 150, 243, 0.4)",
                                        },
                                        transition: "all 0.3s ease-in-out",
                                    }}
                                >
                                    {t("invite.delegateCta", { ticker: pool.ticker })}
                                </Button>
                                <NextLink href="/" passHref legacyBehavior>
                                    <Button
                                        component="a"
                                        variant="outlined"
                                        size="large"
                                        sx={{
                                            flex: 1,
                                            textTransform: "none",
                                            fontWeight: 600,
                                            py: 1.5,
                                            borderRadius: 2,
                                            "&, &:link, &:visited, &:hover, &:active": { color: "primary.main" },
                                        }}
                                    >
                                        {t("invite.setupCta")}
                                    </Button>
                                </NextLink>
                            </Stack>
                        </Stack>
                    ) : null}
                </Box>

                {/* Disclaimer */}
                <Typography
                    variant="caption"
                    sx={{
                        color: "text.secondary",
                        textAlign: "center",
                        maxWidth: 600,
                        mt: 1,
                        opacity: 0.8,
                    }}
                >
                    ☞ {t("invite.disclaimer", {
                        price: hoskyPriceUsd !== null ? `$${hoskyPriceUsd.toExponential(2)}` : "—",
                    })}
                </Typography>

                {/* Pool ID footer */}
                <Typography
                    variant="caption"
                    sx={{
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        color: "text.secondary",
                        opacity: 0.7,
                    }}
                >
                    {shortBech32(pool.poolId)}
                </Typography>
            </Stack>
        </Box>
    );
}

function HorizonCell({
    label,
    hosky,
    usd,
    highlight,
}: {
    label: string;
    hosky: string;
    usd: string;
    highlight?: boolean;
}) {
    return (
        <Box
            sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                bgcolor: highlight ? "rgba(255,107,53,0.08)" : "background.paper",
                border: "1px solid",
                borderColor: highlight ? "rgba(255,107,53,0.3)" : "divider",
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "text.secondary",
                    fontWeight: 700,
                    fontSize: 10.5,
                }}
            >
                {label}
            </Typography>
            <Typography
                sx={{
                    mt: 0.5,
                    fontSize: highlight ? 22 : 18,
                    fontWeight: 700,
                    lineHeight: 1.1,
                    fontFeatureSettings: '"tnum" 1',
                }}
            >
                {hosky}
                <Box component="span" sx={{ fontSize: 11, fontWeight: 600, color: "text.secondary", ml: 0.5 }}>
                    HOSKY
                </Box>
            </Typography>
            <Typography
                sx={{
                    fontSize: highlight ? 18 : 14,
                    fontWeight: 600,
                    color: highlight ? "#B45309" : "text.secondary",
                    mt: 0.25,
                }}
            >
                ≈ {usd}
            </Typography>
        </Box>
    );
}
