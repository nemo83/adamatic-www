/**
 * Coming-soon placeholder for the generic recurring-payment flow.
 *
 * The `mode="generic"` code path in PaymentForm is partially wired but not
 * shippable yet (no fetchGenericTemplate, maxPaymentDelayHours never written
 * to state, and the submit gate hardcodes HOSKY delegation). This page exists
 * so the landing CTA has a destination and so the route doesn't 404 if shared.
 */
import Head from "next/head";
import NextLink from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useTranslations } from "../../src/lib/i18n/I18nProvider";

export default function SetupGenericRoute() {
    const t = useTranslations();
    return (
        <>
            <Head>
                <title key="title">{t("setup.generic.comingSoon.title")} · AdaMatic</title>
                <meta name="description" content={t("setup.generic.comingSoon.body")} key="description" />
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
