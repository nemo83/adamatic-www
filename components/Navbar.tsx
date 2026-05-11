import {
    AppBar,
    Box,
    Chip,
    Toolbar,
    Button,
    Stack,
    IconButton,
    Menu,
    MenuItem,
    Divider,
    Typography,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CheckIcon from "@mui/icons-material/Check";
import { useWallet } from "../src/lib/wallet/useWallet";
import { WalletButton } from "../src/lib/wallet/WalletButton";
import { LocaleSwitcher } from "../src/lib/i18n/LocaleSwitcher";
import { SUPPORTED_LOCALES, useI18n, type Locale } from "../src/lib/i18n/I18nProvider";
import React, { useEffect, useState } from "react";
import { NETWORK, NETWORK_ID } from "../src/lib/cardano/constants";
import toast from "react-hot-toast";
import Link from "next/link";
import Logo from "./Logo";

// Locale display names used in the hamburger language section. Kept in
// sync with LocaleSwitcher.tsx — autonyms (each language in its own
// language) so they're recognisable regardless of the active locale.
const LOCALE_LABELS: Record<Locale, string> = {
    en: "English",
    fr: "Français",
    es: "Español",
    it: "Italiano",
    ja: "日本語",
};

export default function Navbar() {
    const { connected, networkId } = useWallet();
    const { t, locale, setLocale } = useI18n();

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

    // Mobile hamburger menu state. Holds the nav links + a language
    // section so xs viewports don't need a separate LocaleSwitcher pill
    // crowding the wallet button.
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const openMenu = (e: React.MouseEvent<HTMLButtonElement>) =>
        setMenuAnchor(e.currentTarget);
    const closeMenu = () => setMenuAnchor(null);
    const chooseLocale = (l: Locale) => {
        setLocale(l);
        closeMenu();
    };

    const navItems = [
        { href: "/", key: "setup" as const },
        { href: "/payments", key: "myPulls" as const },
        { href: "/faq", key: "faq" as const },
    ];

    return (
        <Box>
            <AppBar position="static" component="nav">
                {/* Top row — logo + BETA + (md+ nav links / locale / wallet) + (xs hamburger) */}
                <Toolbar
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                            component={Link}
                            href="/"
                            data-tut="step-welcome"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                cursor: "pointer",
                                textDecoration: "none",
                                "&, &:link, &:visited, &:hover, &:active": {
                                    color: "inherit",
                                    textDecoration: "none",
                                },
                                "&:hover": {
                                    transform: "scale(1.02)",
                                    transition: "transform 0.2s ease-in-out",
                                },
                            }}
                        >
                            <Logo surface="dark" />
                        </Box>
                        <Chip
                            label="BETA"
                            size="small"
                            sx={{
                                height: 22,
                                fontSize: 10.5,
                                fontWeight: 800,
                                letterSpacing: "0.16em",
                                color: "white",
                                bgcolor: "rgba(255,255,255,0.16)",
                                border: "1px solid rgba(255,255,255,0.32)",
                                "& .MuiChip-label": { px: 1 },
                            }}
                        />

                        {/* Desktop nav links */}
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                display: { xs: "none", md: "flex" },
                                ml: 4,
                            }}
                        >
                            {navItems.map((item) => (
                                <Button
                                    key={item.key}
                                    component={Link}
                                    href={item.href}
                                    color="inherit"
                                    sx={{
                                        textTransform: "none",
                                        "&, &:link, &:visited, &:hover, &:active": { color: "inherit" },
                                    }}
                                >
                                    {t(`nav.${item.key}`)}
                                </Button>
                            ))}
                        </Stack>
                    </Box>

                    {/* Right cluster — locale+wallet on md+, hamburger on xs */}
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ display: { xs: "none", md: "flex" } }}
                    >
                        <LocaleSwitcher />
                        <Box data-tut="step-0">
                            <WalletButton />
                        </Box>
                    </Stack>

                    <IconButton
                        aria-label={t("nav.menu")}
                        onClick={openMenu}
                        color="inherit"
                        edge="end"
                        sx={{ display: { xs: "inline-flex", md: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Toolbar>

                {/* Mobile wallet row — second line on xs only. Wallet gets
                    the spotlight as the primary action; locale lives in
                    the hamburger to keep this row uncluttered. */}
                <Box
                    sx={{
                        display: { xs: "flex", md: "none" },
                        justifyContent: "center",
                        px: 2,
                        pb: 1.25,
                    }}
                >
                    <Box data-tut="step-0" sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <WalletButton />
                    </Box>
                </Box>
            </AppBar>

            {/* Hamburger menu — nav links + language section */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={closeMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                {navItems.map((item) => (
                    <MenuItem
                        key={item.key}
                        component={Link}
                        href={item.href}
                        onClick={closeMenu}
                    >
                        {t(`nav.${item.key}`)}
                    </MenuItem>
                ))}
                <Divider />
                <Typography
                    variant="overline"
                    sx={{
                        display: "block",
                        px: 2,
                        pt: 0.5,
                        color: "text.secondary",
                        fontWeight: 700,
                        letterSpacing: "0.16em",
                    }}
                >
                    {t("nav.language")}
                </Typography>
                {SUPPORTED_LOCALES.map((l) => (
                    <MenuItem
                        key={l}
                        selected={l === locale}
                        onClick={() => chooseLocale(l)}
                    >
                        <ListItemIcon>
                            {l === locale ? (
                                <CheckIcon fontSize="small" />
                            ) : (
                                <span style={{ width: 20 }} />
                            )}
                        </ListItemIcon>
                        <ListItemText>{LOCALE_LABELS[l]}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}
