/**
 * Dynamic Open Graph image for /invite/[poolId].
 *
 * Renders a 1200×630 PNG via Next's edge `ImageResponse` so social embeds
 * (Twitter/X, Discord, Telegram, …) preview pool branding + key stats
 * instead of the default AdaMatic card.
 *
 * Hits this route directly to debug:
 *   /api/og/invite/EASY1
 *   /api/og/invite/<bech32>
 *   /api/og/invite/<hex>
 */
import { ImageResponse } from "next/og";
import { resolveCuratedPool } from "../../../../src/lib/cardano/curatedPools";

export const config = {
    runtime: "edge",
};

const PARCHMENT = "#FAF7F2";
const SURFACE = "#FFFEFB";
const INK = "#1F1B16";
const INK_MUTED = "#6B645B";
const HAIRLINE = "#E8E1D5";
const AMBER = "#F59E0B";
const AMBER_DEEP = "#B45309";
const FOREST = "#2E7D5C";

export default async function handler(req: Request) {
    const url = new URL(req.url);
    // The path is /api/og/invite/<id>; grab the last segment.
    const segments = url.pathname.split("/").filter(Boolean);
    const idOrTicker = decodeURIComponent(segments[segments.length - 1] ?? "");
    const pool = resolveCuratedPool(idOrTicker);
    // Honour the actual deployed host (so the footer URL on beta says
    // "beta.adamatic.xyz" rather than the prod canonical).
    const displayHost = url.host;

    if (!pool) {
        return new ImageResponse(
            (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: PARCHMENT,
                        color: INK,
                        fontFamily: "Georgia, serif",
                        fontSize: 56,
                        fontStyle: "italic",
                    }}
                >
                    Pool not found
                </div>
            ),
            { width: 1200, height: 630 },
        );
    }

    const saturationPct = ((pool.liveSaturation ?? 0) * 100).toFixed(1);
    const feePct = ((pool.marginCost ?? 0) * 100).toFixed(2);
    const delegators = (pool.liveDelegators ?? 0).toLocaleString();

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: PARCHMENT,
                    backgroundImage: `radial-gradient(900px 400px at 0% 0%, rgba(245,158,11,0.08), transparent 60%), radial-gradient(700px 350px at 100% 100%, rgba(46,125,92,0.05), transparent 60%)`,
                    color: INK,
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    padding: "48px 64px",
                    position: "relative",
                }}
            >
                {/* Top broadsheet rule */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: `2px solid ${INK}`,
                        paddingBottom: 12,
                        fontSize: 18,
                        fontFamily: "Helvetica, Arial, sans-serif",
                        fontWeight: 700,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: INK,
                    }}
                >
                    <div style={{ display: "flex" }}>
                        <span style={{ color: INK }}>Ada</span>
                        <span style={{ color: AMBER_DEEP }}>matic</span>
                        <span
                            style={{
                                marginLeft: 14,
                                fontWeight: 500,
                                fontSize: 14,
                                opacity: 0.6,
                                alignSelf: "flex-end",
                                paddingBottom: 4,
                            }}
                        >
                            beta
                        </span>
                    </div>
                    <span>◇ Pool Invitation ◇</span>
                </div>

                {/* Eyebrow */}
                <div
                    style={{
                        display: "flex",
                        marginTop: 36,
                        fontSize: 20,
                        fontFamily: "Helvetica, Arial, sans-serif",
                        fontWeight: 700,
                        letterSpacing: "0.24em",
                        textTransform: "uppercase",
                        color: AMBER_DEEP,
                    }}
                >
                    ◇ Earn HOSKY by delegating
                </div>

                {/* Pool ticker — hero */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "baseline",
                        marginTop: 18,
                        gap: 24,
                    }}
                >
                    <span
                        style={{
                            fontSize: 144,
                            fontWeight: 700,
                            lineHeight: 1,
                            letterSpacing: "-0.03em",
                            color: INK,
                        }}
                    >
                        {pool.ticker}
                    </span>
                    {pool.name && pool.name !== pool.ticker && (
                        <span
                            style={{
                                fontSize: 32,
                                fontStyle: "italic",
                                color: INK_MUTED,
                                fontWeight: 400,
                                maxWidth: 560,
                                lineHeight: 1.2,
                                paddingBottom: 14,
                            }}
                        >
                            {pool.name}
                        </span>
                    )}
                </div>

                {/* Description */}
                {pool.description && (
                    <div
                        style={{
                            display: "flex",
                            marginTop: 12,
                            fontSize: 22,
                            color: INK_MUTED,
                            fontStyle: "italic",
                            maxWidth: 880,
                            lineHeight: 1.4,
                        }}
                    >
                        {pool.description}
                    </div>
                )}

                {/* Spacer pushing footer down */}
                <div style={{ display: "flex", flex: 1 }} />

                {/* Stats row */}
                <div
                    style={{
                        display: "flex",
                        gap: 40,
                        alignItems: "flex-end",
                        marginTop: 40,
                    }}
                >
                    <Stat
                        label="HOSKY / ADA / epoch"
                        value={pool.hoskyada.toLocaleString()}
                        accent={AMBER_DEEP}
                        big
                    />
                    <div
                        style={{
                            display: "flex",
                            width: 1,
                            height: 80,
                            background: HAIRLINE,
                            alignSelf: "center",
                        }}
                    />
                    <Stat label="Saturation" value={`${saturationPct}%`} />
                    <Stat label="Pool fee" value={`${feePct}%`} />
                    <Stat label="Delegators" value={delegators} />
                </div>

                {/* Bottom rule + footer */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 28,
                        paddingTop: 16,
                        borderTop: `1px solid ${INK}`,
                        fontSize: 18,
                        fontFamily: "Helvetica, Arial, sans-serif",
                        color: INK,
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                    }}
                >
                    <span style={{ color: INK_MUTED }}>
                        {displayHost}/invite/{pool.ticker.toLowerCase()}
                    </span>
                    <span
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            color: FOREST,
                            fontWeight: 700,
                        }}
                    >
                        ☞ Delegate &amp; collect HOSKY each epoch
                    </span>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        },
    );
}

function Stat({
    label,
    value,
    big,
    accent,
}: {
    label: string;
    value: string;
    big?: boolean;
    accent?: string;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <span
                style={{
                    fontSize: 14,
                    fontFamily: "Helvetica, Arial, sans-serif",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: INK_MUTED,
                    marginBottom: 6,
                }}
            >
                {label}
            </span>
            <span
                style={{
                    fontSize: big ? 80 : 44,
                    fontWeight: big ? 700 : 600,
                    color: accent ?? INK,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                }}
            >
                {value}
            </span>
        </div>
    );
}
