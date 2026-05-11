/**
 * Marketing landing.
 *
 * Order is intentionally explainer-first so newcomers understand the product
 * before they're asked to convert:
 *   1. Hero          — pitch + primary CTA (returning users one click away)
 *   2. How it works  — 3-step explainer
 *   3. Set up        — chooser cards (HOSKY live, generic coming soon)
 *   4. Live stats    — credibility (mock until BE wires)
 *   5. Community     — social proof (mock quotes)
 *
 * Tour is NOT initialised here — it fires on /setup/hosky where the form
 * fields it points at actually exist.
 */
import type { GetServerSideProps } from "next";
import Head from "next/head";
import NextLink from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import PaymentsIcon from "@mui/icons-material/Payments";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ScheduleIcon from "@mui/icons-material/Schedule";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { useTranslations } from "../src/lib/i18n/I18nProvider";
import { fetchStats } from "../src/lib/api/adamatic";

interface LandingProps {
    baseUrl: string;
}

// Derive an absolute origin from the request so per-page `og:image` URLs
// are absolute — X/Twitter drops cards when og:image is relative.
// Mirrors the pattern in pages/setup/hosky.tsx.
export const getServerSideProps: GetServerSideProps<LandingProps> = async (ctx) => {
    const fwdProto = ctx.req.headers["x-forwarded-proto"];
    const proto =
        typeof fwdProto === "string"
            ? fwdProto.split(",")[0].trim()
            : Array.isArray(fwdProto)
                ? fwdProto[0]
                : ctx.req.headers.host?.startsWith("localhost")
                    ? "http"
                    : "https";
    const host = ctx.req.headers.host ?? "";
    const baseUrl = host ? `${proto}://${host}` : "";
    return { props: { baseUrl } };
};

// Initial / fallback values for the live-stats strip. Used until the BE
// fetch resolves (or if it fails) so the section never flashes a "0 / 0 /
// 0" placeholder for first-time visitors. Real numbers replace these on
// mount when /stats responds.
const FALLBACK_STATS = {
    tvlAda: 8_420,
    scheduledCount: 156,
    executedCount: 1_247,
};

// Community quotes shown in the "From the community" strip. Real quotes
// only — add new entries as they come in (Discord, X, etc.).
const COMMUNITY_QUOTES: { quote: string; author: string }[] = [
    {
        quote: "Before Adamatic, I couldn't go on vacation like Vegas, without risking losing the HW wallet in the ocean or just miss the rewards.",
        author: "@ghosttsohg1",
    },
];

const SECTION_MAX_WIDTH = 1000;

export default function Home({ baseUrl }: LandingProps) {
    const t = useTranslations();
    const [stats, setStats] = useState(FALLBACK_STATS);
    const ogUrl = `${baseUrl}/api/og/landing`;
    const pageUrl = `${baseUrl}/`;
    const title = `AdaMatic — ${t("landing.hero.title")}`;
    const description = t("landing.hero.subtitle");
    useEffect(() => {
        let cancelled = false;
        fetchStats().then((s) => {
            if (cancelled || !s) return;
            // tvl_lovelace is a string (can exceed safe-int range). For
            // display we want a rounded ADA number, so divide via BigInt
            // then convert at the millionth-precision boundary.
            const tvlAda = Number(BigInt(s.tvl_lovelace) / 1_000_000n);
            setStats({
                tvlAda,
                scheduledCount: s.scheduled_count,
                executedCount: s.executed_count,
            });
        });
        return () => {
            cancelled = true;
        };
    }, []);
    return (
        <>
            <Head>
                <title key="title">{title}</title>
                <meta name="description" content={description} key="description" />
                <meta property="og:title" content={title} key="og:title" />
                <meta property="og:description" content={description} key="og:description" />
                <meta property="og:type" content="website" key="og:type" />
                <meta property="og:url" content={pageUrl} key="og:url" />
                <meta property="og:image" content={ogUrl} key="og:image" />
                <meta property="og:image:secure_url" content={ogUrl} key="og:image:secure_url" />
                <meta property="og:image:alt" content="AdaMatic — Automate your Cardano payments" key="og:image:alt" />
                <meta property="og:image:width" content="1200" key="og:image:width" />
                <meta property="og:image:height" content="630" key="og:image:height" />
                <meta property="og:image:type" content="image/png" key="og:image:type" />
                <meta name="twitter:card" content="summary_large_image" key="twitter:card" />
                <meta name="twitter:title" content={title} key="twitter:title" />
                <meta name="twitter:description" content={description} key="twitter:description" />
                <meta name="twitter:image" content={ogUrl} key="twitter:image" />
                <meta name="twitter:image:alt" content="AdaMatic — Automate your Cardano payments" key="twitter:image:alt" />
            </Head>
            <Box
            sx={(theme) => ({
                width: "100%",
                backgroundRepeat: "no-repeat",
                backgroundImage:
                    "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 70%), transparent)",
                ...theme.applyStyles("dark", {
                    backgroundImage:
                        "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
                }),
                scrollBehavior: "smooth",
            })}
        >
            <Stack
                spacing={{ xs: 7, md: 10 }}
                sx={{
                    alignItems: "center",
                    pt: { xs: 8, sm: 12 },
                    pb: { xs: 4, md: 6 },
                    px: { xs: 2, sm: 3 },
                }}
            >
                {/* ─────────────── HERO ─────────────── */}
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={{ xs: 4, md: 6 }}
                    alignItems="center"
                    sx={{ width: "100%", maxWidth: SECTION_MAX_WIDTH }}
                >
                    <Stack
                        spacing={2.5}
                        sx={{ flex: 1, textAlign: { xs: "center", md: "left" }, alignItems: { xs: "center", md: "flex-start" } }}
                    >
                        <Chip
                            label={t("landing.hero.eyebrow")}
                            size="small"
                            sx={{
                                fontWeight: 700,
                                letterSpacing: "0.04em",
                                color: "#0033AD",
                                bgcolor: "rgba(33,150,243,0.10)",
                                border: "1px solid rgba(33,150,243,0.25)",
                            }}
                        />
                        <Typography
                            variant="h2"
                            component="h1"
                            sx={{
                                fontWeight: 800,
                                letterSpacing: "-0.035em",
                                fontSize: "clamp(2.2rem, 6.5vw, 3.4rem)",
                                lineHeight: 1.05,
                                background: "linear-gradient(95deg, #0033AD 0%, #2196F3 60%, #21CBF3 100%)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                maxWidth: 560,
                            }}
                        >
                            {t("landing.hero.title")}
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
                                lineHeight: 1.5,
                                maxWidth: 540,
                            }}
                        >
                            {t("landing.hero.subtitle")}
                        </Typography>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 1, alignItems: "center" }}>
                            <NextLink href="/setup/hosky" passHref legacyBehavior>
                                <Button
                                    component="a"
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 700,
                                        px: 3,
                                        py: 1.25,
                                        borderRadius: 2,
                                        background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                                        boxShadow: "0 8px 20px -10px rgba(33,150,243,0.55)",
                                        "&:hover": {
                                            background: "linear-gradient(45deg, #1976d2 30%, #2196F3 90%)",
                                            transform: "translateY(-1px)",
                                        },
                                        "&, &:link, &:visited, &:hover, &:active": { color: "white" },
                                    }}
                                >
                                    {t("landing.hero.primaryCta")} →
                                </Button>
                            </NextLink>
                            <Button
                                component="a"
                                href="#how-it-works"
                                variant="text"
                                size="large"
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 600,
                                    color: "primary.main",
                                    "&, &:link, &:visited, &:hover, &:active": { color: "primary.main" },
                                }}
                            >
                                {t("landing.hero.secondaryCta")} ↓
                            </Button>
                        </Stack>
                    </Stack>

                    {/* Hero visual — HOSKY doggo in a halo for a playful HOSKY hint */}
                    <Box
                        sx={{
                            flexShrink: 0,
                            width: { xs: 160, sm: 200, md: 220 },
                            height: { xs: 160, sm: 200, md: 220 },
                            borderRadius: 999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                                "linear-gradient(135deg, rgba(0,51,173,0.10) 0%, rgba(33,150,243,0.15) 55%, rgba(33,203,243,0.18) 100%)",
                            border: "1px solid rgba(33,150,243,0.25)",
                            boxShadow: "0 16px 40px -16px rgba(33,150,243,0.45)",
                        }}
                    >
                        <Image
                            src="/img/hosky-doggo.png"
                            alt="HOSKY"
                            width={140}
                            height={140}
                            priority
                            style={{ borderRadius: 9999 }}
                        />
                    </Box>
                </Stack>

                {/* ─────────────── HOW IT WORKS ─────────────── */}
                <Stack
                    id="how-it-works"
                    spacing={4}
                    sx={{
                        width: "100%",
                        maxWidth: SECTION_MAX_WIDTH,
                        alignItems: "center",
                        scrollMarginTop: 80,
                    }}
                >
                    <Typography
                        variant="overline"
                        sx={{ fontWeight: 700, letterSpacing: "0.22em", color: "text.secondary" }}
                    >
                        {t("landing.howItWorks.title")}
                    </Typography>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={{ xs: 3, md: 4 }}
                        sx={{ width: "100%" }}
                        alignItems="stretch"
                    >
                        {[
                            { n: 1, Icon: AccountBalanceWalletOutlinedIcon, key: "step1" },
                            { n: 2, Icon: ScheduleIcon, key: "step2" },
                            { n: 3, Icon: RocketLaunchOutlinedIcon, key: "step3" },
                        ].map(({ n, Icon, key }) => (
                            <Box
                                key={key}
                                sx={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    gap: 1.5,
                                    p: { xs: 2.5, sm: 3 },
                                    borderRadius: 3,
                                    bgcolor: "background.paper",
                                    border: "1px solid",
                                    borderColor: "divider",
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <Box
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 999,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: 800,
                                            color: "white",
                                            background:
                                                "linear-gradient(135deg, #0033AD 0%, #2196F3 60%, #21CBF3 100%)",
                                        }}
                                    >
                                        {n}
                                    </Box>
                                    <Icon sx={{ color: "primary.main", fontSize: 22 }} />
                                </Stack>
                                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
                                    {t(`landing.howItWorks.${key}Title`)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t(`landing.howItWorks.${key}Body`)}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Stack>

                {/* ─────────────── SETUP CHOOSER ─────────────── */}
                <Stack
                    spacing={3}
                    sx={{ width: "100%", maxWidth: SECTION_MAX_WIDTH, alignItems: "center" }}
                >
                    <Typography
                        variant="overline"
                        sx={{ fontWeight: 700, letterSpacing: "0.22em", color: "text.secondary" }}
                    >
                        {t("landing.chooserTitle")}
                    </Typography>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={{ xs: 2, md: 3 }}
                        sx={{ width: "100%" }}
                        alignItems="stretch"
                        justifyContent="center"
                    >
                        {/* HOSKY card — live */}
                        <NextLink href="/setup/hosky" passHref legacyBehavior>
                            <Box
                                component="a"
                                sx={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    gap: 2,
                                    p: { xs: 3, sm: 4 },
                                    borderRadius: 4,
                                    textDecoration: "none",
                                    color: "inherit",
                                    background:
                                        "linear-gradient(135deg, rgba(33, 51, 173, 0.06) 0%, rgba(33, 150, 243, 0.10) 55%, rgba(33, 203, 243, 0.10) 100%)",
                                    border: "1px solid",
                                    borderColor: "rgba(33,150,243,0.35)",
                                    boxShadow: "0 8px 24px -12px rgba(33,150,243,0.35)",
                                    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                                    "&:hover": {
                                        transform: "translateY(-3px)",
                                        boxShadow: "0 16px 32px -12px rgba(33,150,243,0.45)",
                                    },
                                    "&, &:link, &:visited, &:hover, &:active": {
                                        color: "inherit",
                                        textDecoration: "none",
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background:
                                            "linear-gradient(135deg, #0033AD 0%, #2196F3 55%, #21CBF3 100%)",
                                        boxShadow: "0 6px 16px -8px rgba(33,150,243,0.55)",
                                    }}
                                >
                                    <AutorenewIcon sx={{ color: "white", fontSize: "2rem" }} />
                                </Box>
                                <Typography variant="h5" component="h2" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
                                    {t("landing.hosky.title")}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                                    {t("landing.hosky.body")}
                                </Typography>
                                <Button
                                    component="span"
                                    variant="contained"
                                    sx={{
                                        mt: 1,
                                        textTransform: "none",
                                        fontWeight: 600,
                                        px: 3,
                                        py: 1,
                                        borderRadius: 2,
                                        background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                                        "&, &:link, &:visited, &:hover, &:active": { color: "white" },
                                    }}
                                >
                                    {t("landing.hosky.cta")} →
                                </Button>
                            </Box>
                        </NextLink>

                        {/* Generic card — coming soon, visually muted */}
                        <Box
                            sx={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                gap: 2,
                                p: { xs: 3, sm: 4 },
                                borderRadius: 4,
                                background: "rgba(0,0,0,0.02)",
                                border: "1px dashed",
                                borderColor: "divider",
                                opacity: 0.7,
                                position: "relative",
                            }}
                        >
                            <Chip
                                label={t("landing.generic.comingSoon")}
                                size="small"
                                sx={{
                                    position: "absolute",
                                    top: 16,
                                    right: 16,
                                    fontWeight: 600,
                                    bgcolor: "rgba(0,0,0,0.05)",
                                    color: "text.secondary",
                                }}
                            />
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "rgba(0,0,0,0.08)",
                                }}
                            >
                                <PaymentsIcon sx={{ color: "text.secondary", fontSize: "2rem" }} />
                            </Box>
                            <Typography
                                variant="h5"
                                component="h2"
                                sx={{ fontWeight: 700, letterSpacing: "-0.02em", color: "text.secondary" }}
                            >
                                {t("landing.generic.title")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                                {t("landing.generic.body")}
                            </Typography>
                            <Button
                                component="span"
                                variant="outlined"
                                disabled
                                sx={{ mt: 1, textTransform: "none", fontWeight: 600, px: 3, py: 1, borderRadius: 2 }}
                            >
                                {t("landing.generic.comingSoon")}
                            </Button>
                        </Box>
                    </Stack>
                </Stack>

                {/* ─────────────── LIVE STATS ─────────────── */}
                <Stack
                    spacing={3}
                    sx={{ width: "100%", maxWidth: SECTION_MAX_WIDTH, alignItems: "center" }}
                >
                    <Typography
                        variant="overline"
                        sx={{ fontWeight: 700, letterSpacing: "0.22em", color: "text.secondary" }}
                    >
                        {t("landing.stats.title")}
                    </Typography>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        divider={
                            <Divider
                                orientation="vertical"
                                flexItem
                                sx={{ display: { xs: "none", sm: "block" } }}
                            />
                        }
                        spacing={{ xs: 3, sm: 4 }}
                        sx={{
                            width: "100%",
                            py: { xs: 3, sm: 4 },
                            px: { xs: 3, sm: 5 },
                            borderRadius: 4,
                            background:
                                "linear-gradient(135deg, rgba(0,51,173,0.06) 0%, rgba(33,150,243,0.08) 55%, rgba(33,203,243,0.08) 100%)",
                            border: "1px solid",
                            borderColor: "rgba(33,150,243,0.25)",
                        }}
                        alignItems="stretch"
                        justifyContent="space-around"
                    >
                        {[
                            { value: stats.tvlAda.toLocaleString(), suffix: " ₳", key: "tvl" },
                            { value: stats.scheduledCount.toLocaleString(), suffix: "", key: "scheduled" },
                            { value: stats.executedCount.toLocaleString(), suffix: "", key: "executed" },
                        ].map(({ value, suffix, key }) => (
                            <Box key={key} sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
                                <Typography
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
                                        letterSpacing: "-0.03em",
                                        lineHeight: 1.05,
                                        background:
                                            "linear-gradient(95deg, #0033AD 0%, #2196F3 60%, #21CBF3 100%)",
                                        backgroundClip: "text",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                    }}
                                >
                                    {value}
                                    {suffix}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {t(`landing.stats.${key}`)}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Stack>

                {/* ─────────────── COMMUNITY QUOTES ─────────────── */}
                <Stack
                    spacing={4}
                    sx={{ width: "100%", maxWidth: SECTION_MAX_WIDTH, alignItems: "center" }}
                >
                    <Typography
                        variant="overline"
                        sx={{ fontWeight: 700, letterSpacing: "0.22em", color: "text.secondary" }}
                    >
                        {t("landing.community.title")}
                    </Typography>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={{ xs: 2.5, md: 3 }}
                        sx={{ width: "100%" }}
                        alignItems="stretch"
                        justifyContent="center"
                    >
                        {COMMUNITY_QUOTES.map((q) => (
                            <Box
                                key={q.author}
                                sx={{
                                    // Cap width so a single quote doesn't
                                    // sprawl across the section. Grows up
                                    // to ~560px then centres in its track.
                                    flex: 1,
                                    maxWidth: 560,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    p: { xs: 2.5, sm: 3 },
                                    borderRadius: 3,
                                    bgcolor: "background.paper",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    position: "relative",
                                }}
                            >
                                <FormatQuoteIcon
                                    sx={{
                                        color: "primary.main",
                                        opacity: 0.35,
                                        fontSize: 32,
                                        transform: "scaleX(-1)",
                                    }}
                                />
                                <Typography variant="body1" sx={{ fontStyle: "italic", lineHeight: 1.5, flex: 1 }}>
                                    {q.quote}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    {q.author}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Stack>
            </Stack>
        </Box>
        </>
    );
}
