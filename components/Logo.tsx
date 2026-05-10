import { Box, Typography } from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";

type LogoSurface = "light" | "dark";

interface LogoProps {
    /**
     * Background the logo sits on. Both surfaces render the wordmark with
     * a gradient — only the stops change so the contrast holds.
     *
     * `"light"` (default): Cardano-blue → cyan, anchored in the deep blue
     * for brand identity on white/cream surfaces.
     * `"dark"`: white → cyan, lifted into the high-luminance range so it
     * stays readable on the MUI primary AppBar (#1976d2) where the
     * deep-blue start of the light gradient would otherwise collide with
     * the surface. Sweep direction is reversed so the leftmost letters —
     * the ones that were disappearing — sit at near-pure white. The badge
     * keeps its original deep-blue → cyan gradient on both surfaces, so
     * the pair reads as wordmark and badge mirroring each other.
     */
    surface?: LogoSurface;
}

const WORDMARK_GRADIENT: Record<LogoSurface, string> = {
    light: "linear-gradient(95deg, #0033AD 0%, #2196F3 60%, #21CBF3 100%)",
    dark: "linear-gradient(95deg, #FFFFFF 0%, #81D4FA 55%, #29B6F6 100%)",
};

/**
 * AdaMatic wordmark + auto-renew badge. Used in the Navbar; safe to drop
 * anywhere a wordmark fits. Wrap with <Link> at the call site if it
 * should navigate.
 */
export default function Logo({ surface = "light" }: LogoProps = {}) {
    const wordmarkSx = {
        background: WORDMARK_GRADIENT[surface],
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    };

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 } }}>
            <Box
                sx={{
                    width: { xs: 36, sm: 44 },
                    height: { xs: 36, sm: 44 },
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #0033AD 0%, #2196F3 55%, #21CBF3 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 16px -8px rgba(33,150,243,0.55)",
                }}
            >
                <AutorenewIcon
                    sx={{
                        fontSize: { xs: "1.4rem", sm: "1.7rem" },
                        color: "white",
                    }}
                />
            </Box>
            <Typography
                variant="h1"
                sx={{
                    fontSize: "clamp(1.7rem, 5.5vw, 2.4rem)",
                    fontWeight: 700,
                    letterSpacing: "-0.035em",
                    lineHeight: 1,
                    ...wordmarkSx,
                }}
            >
                Adamatic
            </Typography>
        </Box>
    );
}
