/**
 * Custom MUI wallet button — opens a picker listing CIP-30 wallets in
 * `window.cardano.*`. Replaces Mesh's `<CardanoWallet />`.
 */
import React, { useState } from "react";
import {
    Avatar,
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
                startIcon={
                    connecting ? (
                        <CircularProgress size={16} color="inherit" />
                    ) : (
                        <AccountBalanceWalletIcon />
                    )
                }
                onClick={() => setOpen(true)}
                sx={{
                    textTransform: "none",
                    borderRadius: "12px",
                    background:
                        "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                }}
            >
                Connect Wallet
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Connect a Cardano Wallet</DialogTitle>
                <DialogContent dividers>
                    {installedWallets.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            No CIP-30 wallets detected. Install Eternl, Lace,
                            Nami, Typhon, or another Cardano wallet extension
                            and reload the page.
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
