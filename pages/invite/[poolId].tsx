/**
 * Deep-link invite route for rugpool operators.
 *
 * URL: /invite/{poolId}
 *   poolId can be: bech32 (`pool1...`), hex hash (28-byte hex), or ticker
 *   (case-insensitive). Resolved against the curated pool list — unknown
 *   pools render a friendly "not found" page instead of crashing.
 */
import { useRouter } from "next/router";
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

    return <InvitePage pool={pool} />;
}
