/**
 * Deep-link invite route for rugpool operators.
 *
 * URL: /invite/{poolId}
 *   poolId can be: bech32 (`pool1...`), hex hash (28-byte hex), or ticker
 *   (case-insensitive). Resolved server-side against the curated pool list,
 *   so the per-pool Head meta tags render into the SSR HTML where social
 *   crawlers (Discord, Twitter, Telegram) can scrape them.
 */
import type { GetServerSideProps } from "next";
import Head from "next/head";
import NextLink from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";
import {
    resolveCuratedPool,
    type CuratedPool,
} from "../../src/lib/cardano/curatedPools";
import InvitePage from "../../src/features/invite/components/InvitePage";
import { useTranslations } from "../../src/lib/i18n/I18nProvider";

interface Props {
    pool: CuratedPool | null;
    poolIdParam: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const raw = ctx.params?.poolId;
    const poolIdParam = typeof raw === "string" ? raw : "";
    const pool = poolIdParam ? resolveCuratedPool(poolIdParam) : null;
    if (!pool) {
        ctx.res.statusCode = 404;
    }
    return { props: { pool, poolIdParam } };
};

export default function InviteRoute({ pool, poolIdParam }: Props) {
    const t = useTranslations();

    if (!pool) {
        return (
            <>
                <Head>
                    <title key="title">Pool not found · AdaMatic</title>
                    <meta name="robots" content="noindex" key="robots" />
                </Head>
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
                            {t("invite.notFoundBody", { id: poolIdParam })}
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
            </>
        );
    }

    const title = `Earn HOSKY by delegating to ${pool.ticker} · AdaMatic`;
    const saturationPct = ((pool.liveSaturation ?? 0) * 100).toFixed(1);
    const description = pool.description
        ? `${pool.description} · ${pool.hoskyada.toLocaleString()} HOSKY/ADA/epoch · ${saturationPct}% saturated`
        : `${pool.hoskyada.toLocaleString()} HOSKY/ADA/epoch · ${saturationPct}% saturated · Delegate to ${pool.ticker} and earn HOSKY each epoch.`;
    const ogPath = `/api/og/invite/${pool.ticker.toLowerCase()}`;

    return (
        <>
            {/*
             * Each meta tag carries a `key` matching its `property` / `name`
             * so next/head deduplicates against the defaults in
             * `_document.tsx` (otherwise both copies emit and crawlers
             * pick the first one they see — usually the default).
             */}
            <Head>
                <title key="title">{title}</title>
                <meta name="description" content={description} key="description" />
                <meta property="og:title" content={title} key="og:title" />
                <meta property="og:description" content={description} key="og:description" />
                <meta property="og:type" content="website" key="og:type" />
                <meta property="og:image" content={ogPath} key="og:image" />
                <meta property="og:image:secure_url" content={ogPath} key="og:image:secure_url" />
                <meta property="og:image:alt" content={`${pool.ticker} — Hosky Rugpool`} key="og:image:alt" />
                <meta property="og:image:width" content="1200" key="og:image:width" />
                <meta property="og:image:height" content="630" key="og:image:height" />
                <meta property="og:image:type" content="image/png" key="og:image:type" />
                <meta name="twitter:card" content="summary_large_image" key="twitter:card" />
                <meta name="twitter:title" content={title} key="twitter:title" />
                <meta name="twitter:description" content={description} key="twitter:description" />
                <meta name="twitter:image" content={ogPath} key="twitter:image" />
                <meta name="twitter:image:alt" content={`${pool.ticker} — Hosky Rugpool`} key="twitter:image:alt" />
            </Head>
            <InvitePage pool={pool} />
        </>
    );
}
