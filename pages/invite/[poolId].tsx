/**
 * Deep-link invite route for rugpool operators.
 *
 * URL: /invite/{poolId}
 *   poolId can be: bech32 (`pool1...`), hex hash (28-byte hex), or ticker
 *   (case-insensitive). Resolved against the curated pool list — unknown
 *   pools render a friendly "not found" page instead of crashing.
 */
import { useRouter } from "next/router";
import Head from "next/head";
import NextLink from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";
import { resolveCuratedPool } from "../../src/lib/cardano/curatedPools";
import InvitePage from "../../src/features/invite/components/InvitePage";
import { useTranslations } from "../../src/lib/i18n/I18nProvider";

export default function InviteRoute() {
    const router = useRouter();
    const t = useTranslations();
    const poolId = typeof router.query.poolId === "string" ? router.query.poolId : "";
    const pool = poolId ? resolveCuratedPool(poolId) : null;

    if (!router.isReady) {
        return null;
    }

    if (!pool) {
        return (
            <Box
                sx={{
                    minHeight: "calc(100vh - 80px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 3,
                }}
            >
                <Stack
                    spacing={2}
                    sx={{
                        maxWidth: 480,
                        textAlign: "center",
                        p: 4,
                        borderRadius: 3,
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {t("invite.notFoundTitle")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t("invite.notFoundBody", { id: poolId })}
                    </Typography>
                    <NextLink href="/" passHref legacyBehavior>
                        <Button
                            component="a"
                            variant="contained"
                            sx={{
                                textTransform: "none",
                                "&, &:link, &:visited, &:hover, &:active": { color: "white" },
                            }}
                        >
                            {t("invite.backHome")}
                        </Button>
                    </NextLink>
                </Stack>
            </Box>
        );
    }

    const title = `Earn HOSKY by delegating to ${pool.ticker} · AdaMatic`;
    const saturationPct = ((pool.liveSaturation ?? 0) * 100).toFixed(1);
    const description =
        pool.description
            ? `${pool.description} · ${pool.hoskyada.toLocaleString()} HOSKY/ADA/epoch · ${saturationPct}% saturated`
            : `${pool.hoskyada.toLocaleString()} HOSKY/ADA/epoch · ${saturationPct}% saturated · Delegate to ${pool.ticker} and earn HOSKY each epoch.`;
    // Use the ticker as the OG slug — short, stable, cacheable across share platforms.
    const ogPath = `/api/og/invite/${pool.ticker.toLowerCase()}`;

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={ogPath} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                <meta name="twitter:image" content={ogPath} />
            </Head>
            <InvitePage pool={pool} />
        </>
    );
}
