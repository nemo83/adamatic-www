import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import {
    Box,
    Button,
    Grid2,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";
import { useWallet } from "../src/lib/wallet/useWallet";
import { useTranslations } from "../src/lib/i18n/I18nProvider";
import { NETWORK_ID } from "../src/lib/cardano/constants";
import PaymentsTable from "../src/features/payments-list/components/PaymentsTable";

export default function PaymentsPage() {
    const { connected, networkId } = useWallet();
    const t = useTranslations();

    const [validNetwork, setValidNetwork] = useState<boolean>(false);
    const [version, setVersion] = useState<number>(0);

    useEffect(() => {
        if (connected && networkId !== null) {
            setValidNetwork(String(networkId) === NETWORK_ID);
        }
    }, [connected, networkId]);

    return (
        <Box
            sx={(theme) => ({
                width: "100%",
                backgroundRepeat: "no-repeat",
                backgroundImage:
                    "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 70%), transparent)",
                ...theme.applyStyles("dark", {
                    backgroundImage:
                        "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
                }),
            })}
        >
            <Stack
                spacing={4}
                sx={{
                    alignItems: "center",
                    pt: { xs: 4, sm: 7 },
                    pb: 4,
                }}
            >
                <Box width={"750px"} maxWidth={"60%"} sx={{ marginTop: "6rem" }}>
                    {/* Header — title + refresh + new auto-pull CTA */}
                    <Grid2
                        container
                        width={"100%"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                        spacing={2}
                        sx={{ mb: 3 }}
                    >
                        <Grid2>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                {t("setup.myAutoPulls")}
                            </Typography>
                        </Grid2>
                        <Grid2>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                {connected && (
                                    <Tooltip title={t("setup.refreshTooltip")}>
                                        <IconButton
                                            color="primary"
                                            size="large"
                                            aria-label={t("setup.refreshAria")}
                                            onClick={() => setVersion((v) => v + 1)}
                                            sx={{
                                                background:
                                                    "linear-gradient(45deg, rgba(33, 150, 243, 0.1) 30%, rgba(33, 203, 243, 0.1) 90%)",
                                                borderRadius: "12px",
                                                transition: "all 0.3s ease-in-out",
                                                "&:hover": {
                                                    background:
                                                        "linear-gradient(45deg, rgba(33, 150, 243, 0.2) 30%, rgba(33, 203, 243, 0.2) 90%)",
                                                    transform: "rotate(180deg) scale(1.1)",
                                                },
                                            }}
                                        >
                                            <CachedIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <NextLink href="/setup/hosky" passHref legacyBehavior>
                                    <Button
                                        component="a"
                                        variant="contained"
                                        startIcon={<Add />}
                                        sx={{
                                            background:
                                                "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                                            borderRadius: "12px",
                                            fontSize: "1rem",
                                            fontWeight: 600,
                                            textTransform: "none",
                                            px: 2.5,
                                            py: 1,
                                            boxShadow:
                                                "0 4px 15px 0 rgba(33, 150, 243, 0.3)",
                                            transition: "all 0.3s ease-in-out",
                                            "&:hover": {
                                                background:
                                                    "linear-gradient(45deg, #1976d2 30%, #1976d2 90%)",
                                                transform: "translateY(-2px)",
                                                boxShadow:
                                                    "0 6px 20px 0 rgba(33, 150, 243, 0.4)",
                                            },
                                            "&, &:link, &:visited, &:hover, &:active": {
                                                color: "white",
                                            },
                                        }}
                                    >
                                        {t("setup.newAutoPull")}
                                    </Button>
                                </NextLink>
                            </Stack>
                        </Grid2>
                    </Grid2>

                    {!connected ? (
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mt: 4, textAlign: "center" }}
                        >
                            {t("payments.connectHint")}
                        </Typography>
                    ) : !validNetwork ? (
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mt: 4, textAlign: "center" }}
                        >
                            {t("payments.networkHint")}
                        </Typography>
                    ) : (
                        <PaymentsTable version={version} />
                    )}
                </Box>
            </Stack>
        </Box>
    );
}
