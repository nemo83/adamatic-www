/**
 * Static Open Graph image for the landing page (`/`).
 *
 * 1200×630 PNG advertising the product as a whole rather than the HOSKY
 * surface specifically. Used by the per-page `<Head>` in `pages/index.tsx`
 * so the most-shared URL (the bare domain) gets a pitch card instead of
 * falling back to the generic `og-image-1200x630.png`.
 *
 * Hits this route directly to debug:
 *   /api/og/landing
 */
import { ImageResponse } from "next/og";

export const config = {
    runtime: "edge",
};

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
                {/* Top rule — Adamatic wordmark left */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        borderBottom: `1px solid ${HAIRLINE}`,
                        paddingBottom: 18,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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

                {/* Body */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        marginTop: 36,
                        justifyContent: "center",
                        maxWidth: 1000,
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
                        The cheapest auto-pull on Cardano
                    </div>
                    <div
                        style={{
                            display: "flex",
                            marginTop: 18,
                            fontSize: 84,
                            fontWeight: 800,
                            letterSpacing: "-0.035em",
                            lineHeight: 1.04,
                        }}
                    >
                        Automate your Cardano payments.
                    </div>
                    <div
                        style={{
                            display: "flex",
                            marginTop: 24,
                            fontSize: 28,
                            fontWeight: 400,
                            lineHeight: 1.4,
                            color: TEXT_MUTED,
                            maxWidth: 900,
                        }}
                    >
                        HOSKY auto-pulls today. Recurring ADA and fiat-pegged schedules next.
                    </div>
                </div>

                {/* Bottom rule — host + CTA */}
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
                        {displayHost}
                    </span>
                    <span style={{ display: "flex" }}>Start with HOSKY →</span>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            headers: {
                "Cache-Control":
                    "public, max-age=0, s-maxage=600, stale-while-revalidate=86400",
            },
        },
    );
}
