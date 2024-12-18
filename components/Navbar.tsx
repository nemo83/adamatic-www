import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import React, { useState, useEffect } from "react";
import "@meshsdk/react/styles.css";
import { NETWORK, NETWORK_ID } from "../lib/util/Constants";
import toast from "react-hot-toast";

export default function Navbar() {

    const { wallet, connected } = useWallet();

    useEffect(() => {
        if (connected) {
            wallet.getNetworkId().then((id) => {
                const isValidNetwork = String(id) == NETWORK_ID
                if (isValidNetwork) {
                    toast.success("Wallet correctly connected");
                } else {
                    toast.error("Trying to connect to wrong network, please connect to " + NETWORK);
                }
            });
        }
    }, [connected]);

    return (
        <Box >
            <AppBar position="static" component="nav">
                <Toolbar

                    sx={{
                        display: { xs: "flex" },
                        flexDirection: "row",
                        justifyContent: "space-between"
                    }}>


                    <Box>
                        <Typography
                            variant="h1"
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: 'center',
                                fontSize: 'clamp(3rem, 10vw, 3.5rem)',
                            }}
                        >
                            Ada
                            <Typography
                                component="span"
                                variant="h1"
                                sx={(theme) => ({
                                    fontSize: 'inherit',
                                    color: 'primary.dark',
                                    ...theme.applyStyles('dark', {
                                        color: 'secondary.light',
                                    }),
                                })}
                            >
                                matic
                            </Typography>
                        </Typography>
                    </Box>
                    <Box data-tut="step-0">
                        <CardanoWallet />
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>

    )
}