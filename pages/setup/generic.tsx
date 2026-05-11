/**
 * Coming-soon placeholder for the generic recurring-payment flow.
 *
 * The `mode="generic"` code path in PaymentForm is partially wired but not
 * shippable yet (no fetchGenericTemplate, maxPaymentDelayHours never written
 * to state, and the submit gate hardcodes HOSKY delegation). This page exists
 * so the landing CTA has a destination and so the route doesn't 404 if shared.
 */
import type { GetServerSideProps } from "next";
import Head from "next/head";
import NextLink from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useTranslations } from "../../src/lib/i18n/I18nProvider";

interface Props {
    baseUrl: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
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

export default function SetupGenericRoute({ baseUrl }: Props) {
    const t = useTranslations();
    const title = `${t("setup.generic.comingSoon.title")} · AdaMatic`;
    const description = t("setup.generic.comingSoon.body");
    const ogUrl = `${baseUrl}/api/og/setup/generic`;
    const pageUrl = `${baseUrl}/setup/generic`;
    return (
        <>
            <Head>
                <title key="title">{title}</title>
                <meta name="description" content={description} key="description" />
                <meta name="robots" content="noindex" key="robots" />
                <meta property="og:title" content={title} key="og:title" />
                <meta property="og:description" content={description} key="og:description" />
                <meta property="og:type" content="website" key="og:type" />
                <meta property="og:url" content={pageUrl} key="og:url" />
                <meta property="og:image" content={ogUrl} key="og:image" />
                <meta property="og:image:secure_url" content={ogUrl} key="og:image:secure_url" />
                <meta property="og:image:alt" content="AdaMatic — Recurring ADA payments (coming soon)" key="og:image:alt" />
                <meta property="og:image:width" content="1200" key="og:image:width" />
                <meta property="og:image:height" content="630" key="og:image:height" />
                <meta property="og:image:type" content="image/png" key="og:image:type" />
                <meta name="twitter:card" content="summary_large_image" key="twitter:card" />
                <meta name="twitter:title" content={title} key="twitter:title" />
                <meta name="twitter:description" content={description} key="twitter:description" />
                <meta name="twitter:image" content={ogUrl} key="twitter:image" />
                <meta name="twitter:image:alt" content="AdaMatic — Recurring ADA payments (coming soon)" key="twitter:image:alt" />
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
                    spacing={3}
                    sx={{
                        maxWidth: 520,
                        textAlign: "center",
                        p: 4,
                        borderRadius: 3,
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {t("setup.generic.comingSoon.title")}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t("setup.generic.comingSoon.body")}
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center">
                        <NextLink href="/setup/hosky" passHref legacyBehavior>
                            <Button
                                component="a"
                                variant="contained"
                                sx={{
                                    textTransform: "none",
                                    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                                    "&, &:link, &:visited, &:hover, &:active": { color: "white" },
                                }}
                            >
                                {t("setup.generic.comingSoon.cta")}
                            </Button>
                        </NextLink>
                        <NextLink href="/" passHref legacyBehavior>
                            <Button
                                component="a"
                                variant="text"
                                sx={{ textTransform: "none" }}
                            >
                                {t("setup.generic.comingSoon.back")}
                            </Button>
                        </NextLink>
                    </Stack>
                </Stack>
            </Box>
        </>
    );
}
