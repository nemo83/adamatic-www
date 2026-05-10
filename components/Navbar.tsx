import { AppBar, Box, Toolbar, Button, Stack } from "@mui/material";
import { useWallet } from "../src/lib/wallet/useWallet";
import { WalletButton } from "../src/lib/wallet/WalletButton";
import { useTranslations } from "../src/lib/i18n/I18nProvider";
import { LocaleSwitcher } from "../src/lib/i18n/LocaleSwitcher";
import React, { useEffect } from "react";
import { NETWORK, NETWORK_ID } from "../src/lib/cardano/constants";
import toast from "react-hot-toast";
import Link from "next/link";
import GitHubIcon from '@mui/icons-material/GitHub';
import Logo from "./Logo";

export default function Navbar() {

    const { connected, networkId } = useWallet();
    const t = useTranslations();

    useEffect(() => {
        if (connected && networkId !== null) {
            const isValidNetwork = String(networkId) === NETWORK_ID;
            if (isValidNetwork) {
                toast.success(t("wallet.connected"));
            } else {
                toast.error(t("wallet.networkMismatch", { network: NETWORK ?? "" }));
            }
        }
    }, [connected, networkId, t]);

    return (
        <Box >
            <AppBar position="static" component="nav">
                <Toolbar

                    sx={{
                        display: { xs: "flex" },
                        flexDirection: "row",
                        justifyContent: "space-between"
                    }}>


                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            component={Link}
                            href="/"
                            data-tut="step-welcome"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                cursor: 'pointer',
                                textDecoration: 'none',
                                // Pin the anchor color across :link/:visited/:hover/:active
                                // so the user-agent purple never leaks through.
                                '&, &:link, &:visited, &:hover, &:active': {
                                    color: 'inherit',
                                    textDecoration: 'none',
                                },
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                    transition: 'transform 0.2s ease-in-out',
                                }
                            }}>
                                <Logo surface="dark" />
                        </Box>

                        <Stack
                            direction="row" 
                            spacing={1} 
                            sx={{ 
                                display: { xs: 'none', md: 'flex' },
                                ml: 4 
                            }}
                        >
                            <Button
                                component={Link}
                                href="/"
                                color="inherit"
                                sx={{
                                    textTransform: 'none',
                                    '&, &:link, &:visited, &:hover, &:active': { color: 'inherit' },
                                }}
                            >
                                {t("nav.setup")}
                            </Button>
                            <Button
                                component={Link}
                                href="/payments"
                                color="inherit"
                                sx={{
                                    textTransform: 'none',
                                    '&, &:link, &:visited, &:hover, &:active': { color: 'inherit' },
                                }}
                            >
                                {t("nav.myPulls")}
                            </Button>
                            <Button
                                component={Link}
                                href="/faq"
                                color="inherit"
                                sx={{
                                    textTransform: 'none',
                                    '&, &:link, &:visited, &:hover, &:active': { color: 'inherit' },
                                }}
                            >
                                {t("nav.faq")}
                            </Button>
                            <Button
                                color="inherit"
                                startIcon={<GitHubIcon />}
                                sx={{
                                    textTransform: 'none',
                                    '&, &:link, &:visited, &:hover, &:active': { color: 'inherit' },
                                }}
                                href="https://github.com/easy1staking-com/cardano-recurring-payment"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {t("nav.github")}
                            </Button>
                        </Stack>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <LocaleSwitcher />
                        <Box data-tut="step-0">
                            <WalletButton />
                        </Box>
                    </Stack>
                </Toolbar>
            </AppBar>
        </Box>

    )
}