/**
 * Hosky Delegation Modal — design reference (mocks-only, no live data).
 *
 * Visual direction: late-19th-century broadsheet meets vintage dog-show poster.
 * Cream parchment surfaces, espresso ink, HOSKY amber accents, paw-print
 * textures on the featured row, italic flourishes, and rosette ribbon badges
 * for "Best in Show". Editorial serif (Fraunces, with SOFT axis dialed up)
 * paired with a clean humanist sans (DM Sans). Tabular old-style figures on
 * the headline rate so the number reads as a tasty editorial figure rather
 * than a dashboard ticker. Trust-forward gravitas with a wink.
 *
 * Drop in: <HoskyDelegationModal open onClose pools={pools} onDelegate={…} />
 */
import React from "react";
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogContent,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import GroupsIcon from "@mui/icons-material/Groups";
import PercentIcon from "@mui/icons-material/Percent";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import { useTranslations } from "../../../lib/i18n/I18nProvider";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Pool = {
    poolId: string;
    ticker: string;
    name?: string;
    description?: string;
    iconUrl?: string;
    homepage?: string;
    /** HOSKY per ADA per epoch — the headline number. */
    hoskyada: number;
    /** HOSKY per HOSKY-NFT held — secondary signal. */
    hoskynft?: number;
    /** 0..1 saturation. */
    liveSaturation?: number;
    /** 0..1 pool fee for ADA staking rewards. */
    marginCost?: number;
    liveDelegators?: number;
};

export interface HoskyDelegationModalProps {
    open: boolean;
    onClose: () => void;
    pools?: Pool[];
    onDelegate: (poolId: string) => void;
}

// ---------------------------------------------------------------------------
// Theme tokens (inline for the design ref; promote to MUI theme once approved)
// ---------------------------------------------------------------------------

const T = {
    bg: "#FAF7F2", // parchment
    surface: "#FFFEFB", // bone
    ink: "#1F1B16", // espresso
    inkSoft: "#3D362D",
    inkMuted: "#6B645B",
    hairline: "#E8E1D5",
    amber: "#F59E0B",
    amberDeep: "#B45309",
    amberSoft: "#FEF3C7",
    forest: "#2E7D5C",
    forestDeep: "#1F5A40",
    forestSoft: "#E7F2EC",
    warning: "#C75D2C",
};

const FAMILY = {
    display: '"Fraunces", "Playfair Display", Georgia, serif',
    body: '"DM Sans", "Helvetica Neue", system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n: number) => n.toLocaleString("en-US");
const pct = (x?: number) =>
    typeof x === "number" ? `${(x * 100).toFixed(1)}%` : "—";
const shortPoolId = (id: string) =>
    id.length <= 16 ? id : `${id.slice(0, 8)}…${id.slice(-6)}`;

// ---------------------------------------------------------------------------
// Decorative SVGs
// ---------------------------------------------------------------------------

const PawPrintPattern = ({
    color = T.amberDeep,
    opacity = 0.06,
}: {
    color?: string;
    opacity?: number;
}) => (
    <svg
        aria-hidden
        width="100%"
        height="100%"
        style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity,
        }}
    >
        <defs>
            <pattern
                id="hosky-paw-pattern"
                x="0"
                y="0"
                width="86"
                height="86"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(14)"
            >
                <g fill={color}>
                    <ellipse cx="14" cy="22" rx="3" ry="4.2" />
                    <ellipse cx="22" cy="14" rx="3" ry="4.2" />
                    <ellipse cx="32" cy="14" rx="3" ry="4.2" />
                    <ellipse cx="40" cy="22" rx="3" ry="4.2" />
                    <ellipse cx="27" cy="32" rx="6.2" ry="5.2" />
                </g>
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hosky-paw-pattern)" />
    </svg>
);

/** Vintage dog-show award rosette — toothed disc + soft inner ring + label. */
function Rosette({
    size = 36,
    color = T.amberDeep,
    label = "BEST",
}: {
    size?: number;
    color?: string;
    label?: string;
}) {
    return (
        <Box
            sx={{
                position: "relative",
                width: size,
                height: size,
                flexShrink: 0,
            }}
            aria-hidden
        >
            <svg width={size} height={size} viewBox="0 0 60 60">
                <g transform="translate(30 30)">
                    {Array.from({ length: 14 }).map((_, i) => (
                        <rect
                            key={i}
                            x="-2"
                            y="-29"
                            width="4"
                            height="9"
                            fill={color}
                            transform={`rotate(${(i * 360) / 14})`}
                            rx="1"
                        />
                    ))}
                </g>
                <circle cx="30" cy="30" r="20" fill={color} />
                <circle
                    cx="30"
                    cy="30"
                    r="20"
                    fill="none"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="1"
                />
                <circle
                    cx="30"
                    cy="30"
                    r="14"
                    fill="none"
                    stroke="rgba(255,255,255,0.55)"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                />
            </svg>
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FAMILY.display,
                    fontWeight: 800,
                    fontSize: Math.max(7.5, size * 0.22),
                    color: "white",
                    letterSpacing: "0.04em",
                    fontVariationSettings: '"opsz" 9',
                }}
            >
                {label}
            </Box>
        </Box>
    );
}

// ---------------------------------------------------------------------------
// Curated pool data — re-exported from the canonical module so the invite
// page and the modal share a single source of truth.
// ---------------------------------------------------------------------------

import { CURATED_POOLS } from "../../../lib/cardano/curatedPools";

export { HIDDEN_POOL_IDS } from "../../../lib/cardano/curatedPools";

/** @deprecated kept for backwards-compat with consumers that import MOCK_POOLS */
export const MOCK_POOLS: Pool[] = CURATED_POOLS;


// ---------------------------------------------------------------------------
// Tiny chip primitive
// ---------------------------------------------------------------------------

function MetaChip({
    icon,
    label,
    variant = "default",
    accent,
}: {
    icon?: React.ReactNode;
    label: string;
    variant?: "default" | "mono";
    accent?: string;
}) {
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                height: 22,
                px: 1,
                borderRadius: 0.75,
                bgcolor: accent
                    ? `${accent}11`
                    : "rgba(31,27,22,0.04)",
                border: `1px solid ${accent ? `${accent}33` : T.hairline}`,
                fontFamily: variant === "mono" ? FAMILY.mono : FAMILY.body,
                fontSize: variant === "mono" ? 10 : 11,
                color: accent ?? T.inkMuted,
                fontWeight: 500,
                letterSpacing: variant === "mono" ? 0 : "0.01em",
                whiteSpace: "nowrap",
                "& svg": { color: accent ?? T.inkMuted },
            }}
        >
            {icon}
            <span>{label}</span>
        </Box>
    );
}

// ---------------------------------------------------------------------------
// Featured row (HOSKY / EASY1)
// ---------------------------------------------------------------------------

function FeaturedRow({
    pool,
    tier,
    tagline,
    onDelegate,
    delay,
}: {
    pool: Pool;
    tier: "best-in-show" | "pedigree-partner";
    tagline: string;
    onDelegate: (id: string) => void;
    delay: number;
}) {
    const t = useTranslations();
    const isHosky = tier === "best-in-show";
    const accent = isHosky ? T.amber : T.forest;
    const accentDeep = isHosky ? T.amberDeep : T.forestDeep;
    const accentSoft = isHosky ? T.amberSoft : T.forestSoft;
    const ribbonLabel = isHosky
        ? t("delegate.modal.featuredHosky")
        : t("delegate.modal.featuredEasy1");
    const rosetteLabel = isHosky
        ? t("delegate.modal.rosetteBest")
        : t("delegate.modal.rosetteBuilt");

    return (
        <Box
            role="button"
            tabIndex={0}
            onClick={() => onDelegate(pool.poolId)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onDelegate(pool.poolId);
                }
            }}
            sx={{
                position: "relative",
                bgcolor: T.surface,
                border: `1px solid ${T.hairline}`,
                borderRadius: 1.5,
                overflow: "hidden",
                mb: 1.25,
                cursor: "pointer",
                transition:
                    "transform 220ms cubic-bezier(.2,.8,.2,1), box-shadow 220ms, border-color 220ms",
                animation: `fadeUp 480ms cubic-bezier(.2,.8,.2,1) ${delay}ms backwards`,
                "@keyframes fadeUp": {
                    from: { opacity: 0, transform: "translateY(10px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                },
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 14px 32px -14px rgba(31,27,22,0.22)`,
                    borderColor: accent,
                },
                "&:focus-visible": {
                    outline: `2px solid ${accent}`,
                    outlineOffset: 2,
                },
            }}
        >
            {isHosky && <PawPrintPattern color={accentDeep} opacity={0.05} />}

            {/* accent left rule */}
            <Box
                sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    bgcolor: accent,
                }}
                aria-hidden
            />

            <Box
                sx={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "auto 1fr",
                        sm: "auto 1fr auto",
                    },
                    alignItems: "center",
                    gap: { xs: 2, sm: 3 },
                    px: { xs: 2.5, sm: 3.5 },
                    py: { xs: 2.5, sm: 3 },
                }}
            >
                {/* avatar + rosette */}
                <Box sx={{ position: "relative" }}>
                    <Avatar
                        src={pool.iconUrl}
                        alt={pool.ticker}
                        sx={{
                            width: { xs: 56, sm: 68 },
                            height: { xs: 56, sm: 68 },
                            bgcolor: accentSoft,
                            border: `2px solid ${accent}`,
                            boxShadow: `0 4px 14px -6px ${accent}80`,
                            fontFamily: FAMILY.display,
                            fontWeight: 700,
                            fontSize: 22,
                            color: accentDeep,
                        }}
                    >
                        {pool.ticker.slice(0, 1)}
                    </Avatar>
                    <Box
                        sx={{
                            position: "absolute",
                            right: -8,
                            bottom: -8,
                            transform: "rotate(-10deg)",
                            filter: "drop-shadow(0 2px 4px rgba(31,27,22,0.18))",
                        }}
                    >
                        <Rosette
                            size={32}
                            color={accentDeep}
                            label={rosetteLabel}
                        />
                    </Box>
                </Box>

                {/* main content */}
                <Box sx={{ minWidth: 0 }}>
                    <Box
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.75,
                            fontFamily: FAMILY.body,
                            fontSize: 9.5,
                            fontWeight: 700,
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            color: accentDeep,
                            bgcolor: accentSoft,
                            px: 1.25,
                            py: 0.45,
                            borderRadius: 0.5,
                            mb: 1.25,
                        }}
                    >
                        <Box
                            component="span"
                            sx={{ fontSize: 11, lineHeight: 1 }}
                        >
                            ◆
                        </Box>
                        {ribbonLabel}
                    </Box>

                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={{ xs: 0.25, sm: 1.5 }}
                        alignItems={{ xs: "flex-start", sm: "baseline" }}
                        sx={{ mb: 0.5 }}
                    >
                        <Typography
                            component="div"
                            sx={{
                                fontFamily: FAMILY.display,
                                fontVariationSettings:
                                    '"opsz" 144, "SOFT" 50',
                                fontSize: { xs: 28, sm: 34 },
                                fontWeight: 600,
                                lineHeight: 1.05,
                                letterSpacing: "-0.015em",
                                color: T.ink,
                            }}
                        >
                            {pool.ticker}
                        </Typography>
                        {pool.name && pool.name !== pool.ticker && (
                            <Typography
                                sx={{
                                    fontFamily: FAMILY.display,
                                    fontStyle: "italic",
                                    fontSize: { xs: 14, sm: 16 },
                                    color: T.inkMuted,
                                    fontWeight: 400,
                                }}
                            >
                                {pool.name}
                            </Typography>
                        )}
                    </Stack>

                    <Typography
                        sx={{
                            fontFamily: FAMILY.display,
                            fontStyle: "italic",
                            fontSize: { xs: 14, sm: 15 },
                            color: T.inkSoft,
                            mb: 1.5,
                            fontVariationSettings:
                                '"opsz" 14, "SOFT" 70',
                        }}
                    >
                        {tagline}
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 1.25,
                            mb: 1.5,
                            flexWrap: "wrap",
                        }}
                    >
                        <Typography
                            component="span"
                            sx={{
                                fontFamily: FAMILY.display,
                                fontVariationSettings:
                                    '"opsz" 144, "SOFT" 30',
                                fontSize: { xs: 38, sm: 48 },
                                fontWeight: 500,
                                color: accentDeep,
                                lineHeight: 1,
                                letterSpacing: "-0.025em",
                                fontFeatureSettings: '"tnum" 1, "lnum" 0',
                            }}
                        >
                            {fmt(pool.hoskyada)}
                        </Typography>
                        <Typography
                            component="span"
                            sx={{
                                fontFamily: FAMILY.body,
                                fontSize: 12,
                                color: T.inkMuted,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                fontWeight: 600,
                            }}
                        >
                            {t("delegate.modal.rateUnit")}
                        </Typography>
                    </Box>

                    <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ rowGap: 0.5 }}
                    >
                        <MetaChip
                            icon={
                                <WaterDropIcon
                                    sx={{ fontSize: "13px !important" }}
                                />
                            }
                            label={t("delegate.modal.saturationChip", { pct: pct(pool.liveSaturation) })}
                        />
                        <MetaChip
                            icon={
                                <PercentIcon
                                    sx={{ fontSize: "13px !important" }}
                                />
                            }
                            label={t("delegate.modal.feeChip", { pct: pct(pool.marginCost) })}
                        />
                        <MetaChip
                            icon={
                                <GroupsIcon
                                    sx={{ fontSize: "13px !important" }}
                                />
                            }
                            label={t("delegate.modal.delegatorsChip", { n: fmt(pool.liveDelegators ?? 0) })}
                        />
                        <MetaChip
                            variant="mono"
                            label={shortPoolId(pool.poolId)}
                        />
                    </Stack>
                </Box>

                {/* CTA */}
                <Box
                    sx={{
                        gridColumn: { xs: "1 / -1", sm: "auto" },
                        justifySelf: { xs: "stretch", sm: "end" },
                        alignSelf: "center",
                    }}
                >
                    <Button
                        variant="contained"
                        disableElevation
                        endIcon={<OpenInNewIcon fontSize="small" />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelegate(pool.poolId);
                        }}
                        sx={{
                            fontFamily: FAMILY.body,
                            fontWeight: 600,
                            fontSize: 14,
                            letterSpacing: "0.02em",
                            textTransform: "none",
                            bgcolor: accentDeep,
                            color: T.surface,
                            borderRadius: 1.25,
                            px: 2.75,
                            py: 1.25,
                            minWidth: { xs: "100%", sm: 140 },
                            transition: "background 200ms, transform 200ms",
                            "&:hover": {
                                bgcolor: T.ink,
                                transform: "translateX(2px)",
                            },
                        }}
                    >
                        {t("delegate.modal.delegateButton")}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

// ---------------------------------------------------------------------------
// Compact pool row
// ---------------------------------------------------------------------------

function PoolRow({
    pool,
    indexLabel,
    onDelegate,
    delay,
}: {
    pool: Pool;
    indexLabel: string;
    onDelegate: (id: string) => void;
    delay: number;
}) {
    const t = useTranslations();
    const oversaturated =
        typeof pool.liveSaturation === "number" && pool.liveSaturation > 0.85;

    return (
        <Box
            role="button"
            tabIndex={oversaturated ? -1 : 0}
            onClick={() => !oversaturated && onDelegate(pool.poolId)}
            onKeyDown={(e) => {
                if (oversaturated) return;
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onDelegate(pool.poolId);
                }
            }}
            sx={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: {
                    xs: "auto 1fr auto",
                    sm: "32px auto 1fr auto auto",
                },
                alignItems: "center",
                gap: { xs: 1.25, sm: 2 },
                px: { xs: 1.5, sm: 2 },
                py: 1.5,
                borderRadius: 1,
                cursor: oversaturated ? "default" : "pointer",
                opacity: oversaturated ? 0.55 : 1,
                transition: "background 160ms",
                animation: `fadeUp 380ms cubic-bezier(.2,.8,.2,1) ${delay}ms backwards`,
                "@keyframes fadeUp": {
                    from: { opacity: 0, transform: "translateY(6px)" },
                    to: {
                        opacity: oversaturated ? 0.55 : 1,
                        transform: "translateY(0)",
                    },
                },
                "&:hover": {
                    bgcolor: oversaturated
                        ? "transparent"
                        : "rgba(245,158,11,0.05)",
                },
                "&:focus-visible": {
                    outline: `2px solid ${T.amber}`,
                    outlineOffset: 1,
                },
                "& + &": {
                    borderTop: `1px solid ${T.hairline}`,
                },
            }}
        >
            {/* index — old-style figure */}
            <Typography
                sx={{
                    display: { xs: "none", sm: "block" },
                    fontFamily: FAMILY.display,
                    fontStyle: "italic",
                    fontSize: 14,
                    color: T.inkMuted,
                    textAlign: "right",
                    fontWeight: 400,
                    fontFeatureSettings: '"lnum" 0',
                }}
            >
                {indexLabel}
            </Typography>

            {/* avatar */}
            <Avatar
                src={pool.iconUrl}
                alt={pool.ticker}
                sx={{
                    width: 38,
                    height: 38,
                    bgcolor: T.amberSoft,
                    color: T.amberDeep,
                    fontFamily: FAMILY.display,
                    fontWeight: 600,
                    fontSize: 14,
                    border: `1px solid ${T.hairline}`,
                }}
            >
                {pool.ticker.slice(0, 1)}
            </Avatar>

            {/* ticker + name + meta */}
            <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography
                        sx={{
                            fontFamily: FAMILY.display,
                            fontWeight: 600,
                            fontSize: 16,
                            color: T.ink,
                            letterSpacing: "-0.005em",
                            fontVariationSettings: '"opsz" 16, "SOFT" 30',
                        }}
                    >
                        {pool.ticker}
                    </Typography>
                    {pool.name && pool.name !== pool.ticker && (
                        <Typography
                            sx={{
                                fontFamily: FAMILY.display,
                                fontStyle: "italic",
                                fontSize: 13,
                                color: T.inkMuted,
                                fontWeight: 400,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: { xs: 120, sm: 240 },
                            }}
                        >
                            {pool.name}
                        </Typography>
                    )}
                </Stack>
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mt: 0.25 }}
                    flexWrap="wrap"
                    useFlexGap
                >
                    {oversaturated && (
                        <Box
                            sx={{
                                fontFamily: FAMILY.body,
                                fontSize: 9.5,
                                letterSpacing: "0.16em",
                                textTransform: "uppercase",
                                color: T.warning,
                                fontWeight: 700,
                            }}
                        >
                            {t("delegate.modal.nearSaturation")}
                        </Box>
                    )}
                    <Typography
                        sx={{
                            fontFamily: FAMILY.mono,
                            fontSize: 10.5,
                            color: T.inkMuted,
                        }}
                    >
                        {shortPoolId(pool.poolId)}
                    </Typography>
                    <Typography
                        sx={{
                            display: { xs: "none", sm: "inline" },
                            fontFamily: FAMILY.body,
                            fontSize: 10.5,
                            color: T.inkMuted,
                            letterSpacing: "0.04em",
                        }}
                    >
                        · {t("delegate.modal.feeChip", { pct: pct(pool.marginCost) })}
                        {" · "}
                        {t("delegate.modal.delegatorsChip", { n: fmt(pool.liveDelegators ?? 0) })}
                    </Typography>
                </Stack>
            </Box>

            {/* rate */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 0.5,
                    textAlign: "right",
                    flexShrink: 0,
                }}
            >
                <Typography
                    sx={{
                        fontFamily: FAMILY.display,
                        fontWeight: 600,
                        fontSize: { xs: 18, sm: 22 },
                        color: T.ink,
                        lineHeight: 1,
                        fontFeatureSettings: '"tnum" 1, "lnum" 0',
                        letterSpacing: "-0.01em",
                        fontVariationSettings: '"opsz" 22, "SOFT" 30',
                    }}
                >
                    {fmt(pool.hoskyada)}
                </Typography>
                <Typography
                    sx={{
                        display: { xs: "none", sm: "inline" },
                        fontFamily: FAMILY.body,
                        fontSize: 10.5,
                        color: T.inkMuted,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                    }}
                >
                    {t("delegate.modal.rateShortPerAda")}
                </Typography>
            </Box>

            {/* button */}
            <Button
                variant="text"
                size="small"
                disabled={oversaturated}
                onClick={(e) => {
                    e.stopPropagation();
                    onDelegate(pool.poolId);
                }}
                sx={{
                    display: { xs: "none", sm: "inline-flex" },
                    fontFamily: FAMILY.body,
                    fontWeight: 600,
                    fontSize: 12.5,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: T.inkSoft,
                    minWidth: 0,
                    px: 1.5,
                    transition: "all 180ms",
                    "&:hover": {
                        bgcolor: T.amberSoft,
                        color: T.amberDeep,
                        transform: "translateX(2px)",
                    },
                    "&.Mui-disabled": { color: T.inkMuted },
                }}
            >
                {t("delegate.modal.delegateButton")} ›
            </Button>
        </Box>
    );
}

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------

const HOSKY_ID =
    "pool19m98gdj84d4kxem5h6ch8fvj92pvauhg0y4ktmzr3mln6c45yly";
const EASY1_ID =
    "pool1yr0cv3dtmhcfgqa6yetvmf769ngk89e6tepecmjrmjl2jzcw2lm";

export default function HoskyDelegationModal({
    open,
    onClose,
    pools = MOCK_POOLS,
    onDelegate,
}: HoskyDelegationModalProps) {
    const t = useTranslations();
    const hosky = pools.find((p) => p.poolId === HOSKY_ID);
    const easy1 = pools.find((p) => p.poolId === EASY1_ID);
    const others = pools
        .filter((p) => p.poolId !== HOSKY_ID && p.poolId !== EASY1_ID)
        .sort((a, b) => b.hoskyada - a.hoskyada);

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth={false}
                fullWidth
                PaperProps={{
                    sx: {
                        width: "min(780px, 96vw)",
                        maxHeight: "92vh",
                        display: "flex",
                        flexDirection: "column",
                        bgcolor: T.bg,
                        backgroundImage: `radial-gradient(1200px 600px at 0% 0%, rgba(245,158,11,0.05), transparent 60%), radial-gradient(800px 400px at 100% 100%, rgba(46,125,92,0.03), transparent 60%)`,
                        color: T.ink,
                        fontFamily: FAMILY.body,
                        border: `1px solid ${T.hairline}`,
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: `0 32px 80px -20px rgba(31,27,22,0.45)`,
                    },
                }}
                slotProps={{
                    backdrop: {
                        sx: {
                            backgroundColor: "rgba(31,27,22,0.55)",
                            backdropFilter: "blur(3px)",
                        },
                    },
                }}
            >
                {/* Masthead — fixed */}
                <Box
                    sx={{
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: { xs: 2, sm: 3 },
                        py: 1.25,
                        borderBottom: `1px solid ${T.hairline}`,
                        fontFamily: FAMILY.body,
                        fontSize: 10.5,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: T.inkMuted,
                        bgcolor: T.surface,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.25,
                        }}
                    >
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: T.amber,
                                boxShadow: `0 0 0 3px ${T.amberSoft}`,
                                animation: "pulse 2.4s ease-in-out infinite",
                                "@keyframes pulse": {
                                    "0%, 100%": { opacity: 1 },
                                    "50%": { opacity: 0.5 },
                                },
                            }}
                        />
                        <Box component="span" sx={{ fontWeight: 600 }}>
                            {t("delegate.modal.channel")}
                        </Box>
                        <Box
                            component="span"
                            sx={{
                                color: T.hairline,
                                userSelect: "none",
                            }}
                        >
                            ·
                        </Box>
                        <Box component="span">{t("delegate.modal.epoch", { n: 628 })}</Box>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            color: T.ink,
                            "&:hover": { bgcolor: "rgba(31,27,22,0.06)" },
                        }}
                        aria-label={t("common.close")}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* Scrollable content */}
                <DialogContent
                    sx={{
                        p: 0,
                        flex: 1,
                        overflowY: "auto",
                        // soften scrollbar for the editorial look
                        "&::-webkit-scrollbar": { width: 8 },
                        "&::-webkit-scrollbar-track": {
                            background: "transparent",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            background: T.hairline,
                            borderRadius: 4,
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                            background: T.inkMuted,
                        },
                    }}
                >
                    {/* Editorial title block */}
                    <Box
                        sx={{
                            px: { xs: 3, sm: 5 },
                            pt: { xs: 4, sm: 5 },
                            pb: 3,
                        }}
                    >
                        <Typography
                            component="div"
                            sx={{
                                fontFamily: FAMILY.body,
                                fontSize: 10.5,
                                letterSpacing: "0.24em",
                                textTransform: "uppercase",
                                color: T.amberDeep,
                                fontWeight: 700,
                                mb: 1.75,
                                animation:
                                    "fadeUp 480ms cubic-bezier(.2,.8,.2,1) backwards",
                                "@keyframes fadeUp": {
                                    from: {
                                        opacity: 0,
                                        transform: "translateY(8px)",
                                    },
                                    to: {
                                        opacity: 1,
                                        transform: "translateY(0)",
                                    },
                                },
                            }}
                        >
                            {t("delegate.modal.eyebrow")}
                        </Typography>
                        <Typography
                            component="h1"
                            sx={{
                                fontFamily: FAMILY.display,
                                fontVariationSettings:
                                    '"opsz" 144, "SOFT" 25',
                                fontSize: { xs: 38, sm: 54 },
                                lineHeight: 1.0,
                                fontWeight: 500,
                                letterSpacing: "-0.02em",
                                color: T.ink,
                                mb: 2.25,
                                animation:
                                    "fadeUp 600ms cubic-bezier(.2,.8,.2,1) 80ms backwards",
                            }}
                        >
                            {t("delegate.modal.titleA")}{" "}
                            <Box
                                component="span"
                                sx={{
                                    fontStyle: "italic",
                                    fontWeight: 400,
                                    color: T.amberDeep,
                                    fontVariationSettings:
                                        '"opsz" 144, "SOFT" 100',
                                }}
                            >
                                {t("delegate.modal.titleItalic")}
                            </Box>{" "}
                            {t("delegate.modal.titleC")}
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily: FAMILY.body,
                                fontSize: { xs: 14, sm: 15.5 },
                                lineHeight: 1.6,
                                color: T.inkSoft,
                                maxWidth: 580,
                                animation:
                                    "fadeUp 560ms cubic-bezier(.2,.8,.2,1) 160ms backwards",
                            }}
                        >
                            {t("delegate.modal.deckPart1")}
                            <Box
                                component="span"
                                sx={{
                                    fontFamily: FAMILY.display,
                                    fontStyle: "italic",
                                    color: T.amberDeep,
                                    fontWeight: 500,
                                }}
                            >
                                {t("delegate.modal.deckHosky")}
                            </Box>
                            {t("delegate.modal.deckPart2")}
                            <Box
                                component="span"
                                sx={{
                                    fontFamily: FAMILY.display,
                                    fontStyle: "italic",
                                    color: T.forestDeep,
                                    fontWeight: 500,
                                }}
                            >
                                {t("delegate.modal.deckDecentralise")}
                            </Box>
                            {t("delegate.modal.deckPart3")}
                        </Typography>
                    </Box>

                    {/* Featured rows */}
                    <Box sx={{ px: { xs: 2, sm: 3.5 }, pb: 1 }}>
                        {hosky && (
                            <FeaturedRow
                                pool={hosky}
                                tier="best-in-show"
                                tagline={t("delegate.modal.taglineHosky")}
                                onDelegate={onDelegate}
                                delay={240}
                            />
                        )}
                        {easy1 && (
                            <FeaturedRow
                                pool={easy1}
                                tier="pedigree-partner"
                                tagline={t("delegate.modal.taglineEasy1")}
                                onDelegate={onDelegate}
                                delay={320}
                            />
                        )}
                    </Box>

                    {/* Section divider */}
                    <Box
                        sx={{
                            px: { xs: 3, sm: 5 },
                            pt: 2,
                            pb: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{ flex: 1, height: 1, bgcolor: T.hairline }}
                            aria-hidden
                        />
                        <Typography
                            sx={{
                                fontFamily: FAMILY.body,
                                fontSize: 10.5,
                                letterSpacing: "0.26em",
                                textTransform: "uppercase",
                                color: T.inkMuted,
                                fontWeight: 700,
                            }}
                        >
                            {t("delegate.modal.otherPools")}
                        </Typography>
                        <Box
                            sx={{ flex: 1, height: 1, bgcolor: T.hairline }}
                            aria-hidden
                        />
                    </Box>

                    {/* Compact list */}
                    <Box sx={{ px: { xs: 1.5, sm: 3 }, pb: 3 }}>
                        <Stack spacing={0}>
                            {others.map((p, i) => (
                                <PoolRow
                                    key={p.poolId}
                                    pool={p}
                                    indexLabel={String(i + 3).padStart(
                                        2,
                                        "0",
                                    )}
                                    onDelegate={onDelegate}
                                    delay={400 + i * 28}
                                />
                            ))}
                        </Stack>
                    </Box>
                </DialogContent>

                {/* Footer — fixed. Three-step pointer reinforces the
                    vending-machine flow: delegate → setup → collect. */}
                <Box
                    sx={{
                        flexShrink: 0,
                        borderTop: `1px solid ${T.hairline}`,
                        px: { xs: 3, sm: 5 },
                        py: 2.25,
                        bgcolor: "rgba(31,27,22,0.025)",
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: { xs: 1.5, sm: 2.5 },
                        alignItems: { xs: "flex-start", sm: "center" },
                        justifyContent: "space-between",
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{
                            fontFamily: FAMILY.body,
                            fontSize: 10.5,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            color: T.inkMuted,
                            fontWeight: 600,
                            flexWrap: "wrap",
                            rowGap: 0.5,
                        }}
                    >
                        <Box
                            component="span"
                            sx={{ color: T.amberDeep, fontWeight: 700 }}
                        >
                            {t("delegate.modal.step1")}
                        </Box>
                        <Box component="span" sx={{ color: T.hairline }}>
                            ›
                        </Box>
                        <Box component="span">{t("delegate.modal.step2")}</Box>
                        <Box component="span" sx={{ color: T.hairline }}>
                            ›
                        </Box>
                        <Box component="span">{t("delegate.modal.step3")}</Box>
                    </Stack>
                    <Typography
                        sx={{
                            fontFamily: FAMILY.display,
                            fontStyle: "italic",
                            fontSize: 12,
                            color: T.inkMuted,
                            lineHeight: 1.5,
                            fontVariationSettings: '"opsz" 12, "SOFT" 70',
                            maxWidth: 320,
                            textAlign: { xs: "left", sm: "right" },
                        }}
                    >
                        {t("delegate.modal.fineprint")}
                    </Typography>
                </Box>
            </Dialog>
        </>
    );
}
