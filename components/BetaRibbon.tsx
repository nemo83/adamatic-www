/**
 * Fixed corner-ribbon banner — the classic 45°-rotated stripe pinned to the
 * top-right of the viewport. Non-interactive (visual signal only). Sits at
 * z-index 1101 so it shows above the AppBar (1100) but below modals (1300).
 */
import { Box } from "@mui/material";

export default function BetaRibbon() {
    return (
        <Box
            aria-hidden
            sx={{
                position: "fixed",
                top: 22,
                right: -54,
                width: 200,
                py: 0.5,
                background:
                    "linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)",
                color: "white",
                fontWeight: 800,
                fontSize: 11.5,
                letterSpacing: "0.24em",
                textAlign: "center",
                fontFamily: '"DM Sans", system-ui, sans-serif',
                textShadow: "0 1px 1px rgba(0,0,0,0.18)",
                transform: "rotate(45deg)",
                boxShadow:
                    "0 6px 14px rgba(31,27,22,0.22), inset 0 0 0 1px rgba(255,255,255,0.18)",
                zIndex: 1101,
                pointerEvents: "none",
                userSelect: "none",
            }}
        >
            BETA
        </Box>
    );
}
