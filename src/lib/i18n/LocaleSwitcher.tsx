/**
 * Locale switcher — MUI dropdown for the navbar.
 */
import React, { useState } from "react";
import {
    Box,
    Button,
    Menu,
    MenuItem,
    ListItemText,
    ListItemIcon,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import CheckIcon from "@mui/icons-material/Check";
import { SUPPORTED_LOCALES, useI18n, type Locale } from "./I18nProvider";

const LOCALE_LABELS: Record<Locale, string> = {
    en: "English",
    fr: "Français",
    es: "Español",
    it: "Italiano",
    ja: "日本語",
};

export function LocaleSwitcher() {
    const { locale, setLocale } = useI18n();
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);

    const open = (e: React.MouseEvent<HTMLButtonElement>) =>
        setAnchor(e.currentTarget);
    const close = () => setAnchor(null);
    const choose = (l: Locale) => {
        setLocale(l);
        close();
    };

    return (
        <>
            <Button
                color="inherit"
                onClick={open}
                aria-label={LOCALE_LABELS[locale]}
                // On xs the toolbar is tight — show the globe icon only so
                // the wallet button keeps its room. Label returns on sm+.
                startIcon={
                    <LanguageIcon
                        fontSize="small"
                        sx={{ mr: { xs: "-4px", sm: 0 } }}
                    />
                }
                sx={{
                    textTransform: "none",
                    fontWeight: 500,
                    minWidth: 0,
                    px: { xs: 1, sm: 1.5 },
                }}
            >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                    {LOCALE_LABELS[locale]}
                </Box>
            </Button>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
                {SUPPORTED_LOCALES.map((l) => (
                    <MenuItem
                        key={l}
                        selected={l === locale}
                        onClick={() => choose(l)}
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
        </>
    );
}
