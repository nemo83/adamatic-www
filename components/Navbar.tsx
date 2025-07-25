import { AppBar, Box, Toolbar, Typography, Button, Stack } from "@mui/material";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import React, { useState, useEffect } from "react";
import "@meshsdk/react/styles.css";
import { NETWORK, NETWORK_ID } from "../lib/util/Constants";
import toast from "react-hot-toast";
import Link from "next/link";
import GitHubIcon from '@mui/icons-material/GitHub';

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


                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Link href="/" passHref>
                            <Typography
                                variant="h1"
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: 'center',
                                    fontSize: 'clamp(2rem, 8vw, 3rem)',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    color: 'inherit'
                                }}
                            >
                                Ada
                                <Typography
                                    component="span"
                                    variant="h1"
                                    sx={{
                                        fontSize: 'inherit',
                                        color: 'secondary.light'
                                    }}
                                >
                                    matic<Typography display="inline" variant="h6">(beta)</Typography>
                                </Typography>
                            </Typography>
                        </Link>
                        
                        <Stack 
                            direction="row" 
                            spacing={1} 
                            sx={{ 
                                display: { xs: 'none', md: 'flex' },
                                ml: 4 
                            }}
                        >
                            <Link href="/" passHref>
                                <Button color="inherit" sx={{ textTransform: 'none' }}>
                                    Payments
                                </Button>
                            </Link>
                            <Link href="/faq" passHref>
                                <Button color="inherit" sx={{ textTransform: 'none' }}>
                                    FAQ
                                </Button>
                            </Link>
                            <Button
                                color="inherit"
                                startIcon={<GitHubIcon />}
                                sx={{ textTransform: 'none' }}
                                href="https://github.com/easy1staking-com/cardano-recurring-payment"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                GitHub
                            </Button>
                        </Stack>
                    </Box>
                    <Box data-tut="step-0">
                        <CardanoWallet />
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>

    )
}