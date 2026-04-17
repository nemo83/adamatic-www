/**
 * Custom wallet picker + connected-state pill. Replaces Mesh's
 * <CardanoWallet /> component. Styled with MUI so it fits the existing
 * Hosky/MUI layout — the Ledger design shell picks up its own variant
 * via design/components/WalletPicker.tsx later on.
 */
import React, { useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Stack,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/LogoutRounded";
import { useWallet } from "./useWallet";

function shortAddr(addr: string) {
    if (!addr) return "";
    if (addr.length <= 18) return addr;
    return `${addr.slice(0, 10)}…${addr.slice(-6)}`;
}

export const WalletButton: React.FC = () => {
    const {
        wallet,
        walletId,
        address,
        connecting,
        installedWallets,
        connect,
        disconnect,
        refreshInstalled,
        error,
    } = useWallet();
    const [open, setOpen] = useState(false);

    if (wallet) {
        return (
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2,
                    backgroundColor: "background.paper",
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        opacity: 0.7,
                    }}
                >
                    {walletId}
                </Typography>
                <Box sx={{ width: 1, height: 16, backgroundColor: "divider" }} />
                <Typography
                    variant="body2"
                    sx={{ fontFamily: "ui-monospace, monospace", fontSize: 13 }}
                >
                    {address ? shortAddr(address) : "…"}
                </Typography>
                <IconButton
                    size="small"
                    onClick={disconnect}
                    aria-label="Sign out"
                    sx={{ ml: 0.5 }}
                >
                    <LogoutIcon fontSize="small" />
                </IconButton>
            </Stack>
        );
    }

    return (
        <>
            <Button
                variant="contained"
                disabled={connecting}
                onClick={() => {
                    refreshInstalled();
                    setOpen(true);
                }}
            >
                {connecting ? "Connecting…" : "Connect wallet"}
            </Button>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ pr: 6 }}>
                    Connect wallet
                    <IconButton
                        onClick={() => setOpen(false)}
                        aria-label="Close"
                        sx={{ position: "absolute", right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    {installedWallets.length === 0 ? (
                        <Box sx={{ p: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                No CIP-30 wallet detected. Install Nami, Eternl,
                                Lace, or a compatible wallet and refresh.
                            </Typography>
                            <Button
                                onClick={refreshInstalled}
                                sx={{ mt: 2 }}
                                variant="outlined"
                                size="small"
                            >
                                Refresh
                            </Button>
                        </Box>
                    ) : (
                        <List sx={{ py: 0 }}>
                            {installedWallets.map((w) => (
                                <ListItemButton
                                    key={w.id}
                                    onClick={() => {
                                        connect(w.id).then(() => setOpen(false));
                                    }}
                                >
                                    <Avatar
                                        src={w.icon}
                                        variant="square"
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            mr: 2,
                                            bgcolor: "transparent",
                                            border: "1px solid",
                                            borderColor: "divider",
                                        }}
                                    >
                                        {w.label.slice(0, 2).toUpperCase()}
                                    </Avatar>
                                    <ListItemText
                                        primary={w.label}
                                        secondary={
                                            w.apiVersion
                                                ? `CIP-30 v${w.apiVersion}`
                                                : "CIP-30"
                                        }
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                    {error && (
                        <Box sx={{ px: 3, py: 2 }}>
                            <Typography color="error" variant="body2">
                                {error}
                            </Typography>
                        </Box>
                    )}
                    <Typography
                        variant="caption"
                        sx={{
                            display: "block",
                            px: 3,
                            py: 2,
                            color: "text.secondary",
                        }}
                    >
                        AdaMatic never sees your seed phrase. Every signature is
                        approved inside your wallet.
                    </Typography>
                </DialogContent>
            </Dialog>
        </>
    );
};
