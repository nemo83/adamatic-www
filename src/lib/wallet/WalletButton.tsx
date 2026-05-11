/**
 * Custom MUI wallet button — opens a picker listing CIP-30 wallets in
 * `window.cardano.*`. Replaces Mesh's `<CardanoWallet />`.
 */
import React, { useState } from "react";
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Typography,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useWallet } from "./useWallet";
import { useTranslations } from "../i18n/I18nProvider";

function shortBech32(addr: string): string {
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

export function WalletButton() {
    const {
        connected,
        address,
        connect,
        disconnect,
        installedWallets,
        connecting,
        walletId,
    } = useWallet();
    const t = useTranslations();
    const [open, setOpen] = useState(false);

    const handleConnect = async (id: string) => {
        await connect(id);
        setOpen(false);
    };

    if (connected) {
        return (
            <Button
                variant="outlined"
                color="inherit"
                startIcon={<AccountBalanceWalletIcon />}
                onClick={() => disconnect()}
                sx={{
                    textTransform: "none",
                    borderRadius: "12px",
                    fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
            >
                {address ? shortBech32(address) : walletId}
            </Button>
        );
    }

    return (
        <>
            <Button
                variant="contained"
                aria-label={t("wallet.connect")}
                startIcon={
                    connecting ? (
                        <CircularProgress size={16} color="inherit" />
                    ) : (
                        // Collapse the label-icon gap on xs since the
                        // label itself is hidden there.
                        <AccountBalanceWalletIcon sx={{ mr: { xs: "-4px", sm: 0 } }} />
                    )
                }
                onClick={() => setOpen(true)}
                sx={{
                    textTransform: "none",
                    borderRadius: "12px",
                    background:
                        "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                    minWidth: 0,
                    px: { xs: 1.25, sm: 2 },
                }}
            >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                    {t("wallet.connect")}
                </Box>
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>{t("wallet.pickerTitle")}</DialogTitle>
                <DialogContent dividers>
                    {installedWallets.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            {t("wallet.noExtensions")}
                        </Typography>
                    ) : (
                        <List>
                            {installedWallets.map((w) => (
                                <ListItemButton
                                    key={w.id}
                                    onClick={() => handleConnect(w.id)}
                                    disabled={connecting}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            src={w.icon}
                                            alt={w.label}
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: "transparent",
                                            }}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={w.label}
                                        secondary={
                                            w.apiVersion
                                                ? `CIP-30 ${w.apiVersion}`
                                                : undefined
                                        }
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
