/**
 * Static Open Graph image for /setup/hosky.
 *
 * 1200×630 PNG advertising the HOSKY auto-pull flow. The HOSKY doggo
 * (public/img/hosky-doggo.png) is the visual hero; the AdaMatic badge is
 * the secondary mark in the top-left.
 *
 * Satori (the engine behind next/og) only renders glyphs present in its
 * default font fallback, so this route avoids decorative Unicode (◆ ☞ ⟲)
 * and uses plain ASCII + the basic `→` arrow.
 *
 * Hits this route directly to debug:
 *   /api/og/setup/hosky
 */
import { ImageResponse } from "next/og";

export const config = {
    runtime: "edge",
};

// Palette — pulled from components/Logo.tsx for visual continuity.
const NAVY_DEEP = "#061226";
const CARDANO_BLUE = "#0033AD";
const SKY_BLUE = "#2196F3";
const CYAN = "#21CBF3";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_MUTED = "rgba(255,255,255,0.72)";
const HAIRLINE = "rgba(255,255,255,0.18)";

export default async function handler(req: Request) {
    const url = new URL(req.url);
    const displayHost = url.host;
    // Absolute URL for the doggo asset — Satori fetches it at render time.
    const doggoUrl = `${url.protocol}//${url.host}/img/hosky-doggo.png`;

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${CARDANO_BLUE} 55%, ${SKY_BLUE} 100%)`,
                    backgroundImage: `
                        radial-gradient(900px 500px at 88% 12%, rgba(33,203,243,0.32), transparent 60%),
                        radial-gradient(700px 400px at 6% 92%, rgba(255,209,102,0.10), transparent 60%),
                        linear-gradient(135deg, ${NAVY_DEEP} 0%, ${CARDANO_BLUE} 55%, ${SKY_BLUE} 100%)
                    `,
                    color: TEXT_PRIMARY,
                    fontFamily: "Helvetica, Arial, sans-serif",
                    padding: "56px 72px",
                    position: "relative",
                }}
            >
                {/* Top rule — AdaMatic wordmark left */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        borderBottom: `1px solid ${HAIRLINE}`,
                        paddingBottom: 18,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        {/* Brand badge — gradient circle with the MUI
                             Autorenew double-arrow mark (filled path, since
                             Satori handles solid-fill SVG reliably whereas
                             stroked SVG renders inconsistently). */}
                        <div
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 999,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: `linear-gradient(135deg, ${CARDANO_BLUE} 0%, ${SKY_BLUE} 55%, ${CYAN} 100%)`,
                                boxShadow: `0 8px 20px -10px ${CYAN}`,
                            }}
                        >
                            <svg viewBox="0 0 24 24" width={36} height={36}>
                                <path
                                    fill={TEXT_PRIMARY}
                                    d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
                                />
                            </svg>
                        </div>
                        <span
                            style={{
                                display: "flex",
                                fontSize: 38,
                                fontWeight: 700,
                                letterSpacing: "-0.03em",
                                color: TEXT_PRIMARY,
                            }}
                        >
                            Adamatic
                        </span>
                    </div>
                </div>

                {/* Body: text on the left, doggo on the right */}
                <div
                    style={{
                        display: "flex",
                        flex: 1,
                        marginTop: 36,
                        gap: 48,
                        alignItems: "center",
                    }}
                >
                    {/* Text column */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            flex: 1,
                            maxWidth: 720,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                fontSize: 22,
                                fontWeight: 700,
                                letterSpacing: "0.24em",
                                textTransform: "uppercase",
                                color: CYAN,
                            }}
                        >
                            HOSKY · auto-pull
                        </div>
                        <div
                            style={{
                                display: "flex",
                                marginTop: 16,
                                fontSize: 80,
                                fontWeight: 800,
                                letterSpacing: "-0.035em",
                                lineHeight: 1.04,
                            }}
                        >
                            Collect your HOSKY on a schedule.
                        </div>
                        <div
                            style={{
                                display: "flex",
                                marginTop: 24,
                                fontSize: 26,
                                fontWeight: 400,
                                lineHeight: 1.4,
                                color: TEXT_MUTED,
                            }}
                        >
                            Delegate to a Hosky Rugpool, set the cadence, and AdaMatic auto-pulls your rewards each epoch — like a vending machine for HOSKY.
                        </div>
                    </div>

                    {/* Doggo column — HOSKY icon as the visual hero. Sits in a
                         soft white halo so the colourful icon pops against the
                         deep-navy background. */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 260,
                            height: 260,
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.10)",
                            border: `1px solid ${HAIRLINE}`,
                            boxShadow: `0 16px 40px -16px rgba(255,209,102,0.45)`,
                            flexShrink: 0,
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={doggoUrl}
                            alt="HOSKY"
                            width={200}
                            height={200}
                            style={{
                                width: 200,
                                height: 200,
                                borderRadius: 999,
                                // Smooth the 64x64 source upscale.
                                imageRendering: "auto",
                            }}
                        />
                    </div>
                </div>

                {/* Bottom rule — CTA URL + tagline */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderTop: `1px solid ${HAIRLINE}`,
                        paddingTop: 18,
                        fontSize: 22,
                        color: TEXT_MUTED,
                        fontWeight: 500,
                    }}
                >
                    <span style={{ display: "flex", color: TEXT_PRIMARY, fontWeight: 700 }}>
                        {displayHost}/setup/hosky
                    </span>
                    <span style={{ display: "flex" }}>Start in 30 seconds →</span>
                </div>
            </div>
        ),
        { width: 1200, height: 630 },
    );
}
