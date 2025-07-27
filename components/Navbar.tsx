import { AppBar, Box, Toolbar, Typography, Button, Stack } from "@mui/material";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import React, { useState, useEffect } from "react";
import "@meshsdk/react/styles.css";
import { NETWORK, NETWORK_ID } from "../lib/util/Constants";
import toast from "react-hot-toast";
import Link from "next/link";
import GitHubIcon from '@mui/icons-material/GitHub';
import AutorenewIcon from '@mui/icons-material/Autorenew';

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
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1.5,
                                cursor: 'pointer',
                                textDecoration: 'none',
                                color: 'inherit',
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                    transition: 'transform 0.2s ease-in-out'
                                }
                            }}>
                                <Box sx={{
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    borderRadius: '50%',
                                    p: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <AutorenewIcon sx={{ 
                                        fontSize: { xs: '1.5rem', sm: '2rem' },
                                        color: 'white'
                                    }} />
                                </Box>
                                <Typography
                                    variant="h1"
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: 'center',
                                        fontSize: 'clamp(1.8rem, 6vw, 2.5rem)',
                                        fontWeight: 700,
                                        letterSpacing: '-0.02em'
                                    }}
                                >
                                    Ada
                                    <Typography
                                        component="span"
                                        variant="h1"
                                        sx={{
                                            fontSize: 'inherit',
                                            background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            fontWeight: 'inherit'
                                        }}
                                    >
                                        matic
                                    </Typography>
                                    <Typography 
                                        display="inline" 
                                        variant="caption"
                                        sx={{ 
                                            fontSize: '0.7rem',
                                            opacity: 0.7,
                                            ml: 0.5,
                                            alignSelf: 'flex-start',
                                            mt: { xs: 0, sm: 0.5 }
                                        }}
                                    >
                                        beta
                                    </Typography>
                                </Typography>
                            </Box>
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