import { AppBar, Box, Button, CssBaseline, Link, makeStyles, Switch, Toolbar, Typography } from "@mui/material";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import { BrowserWallet } from "@meshsdk/core";
import React, { useState } from "react";
import "@meshsdk/react/styles.css";

export default function Navbar(props: { network: string, isValidNetwork: boolean, hoskyInput: boolean, setHoskyInput: (hoskyInput: boolean) => void }) {
    const { connected } = useWallet();

    const { network, isValidNetwork, setHoskyInput, hoskyInput } = props;

    return (
        <Box >
            <AppBar position="static" component="nav">
                {/*<CssBaseline />*/}
                <Toolbar
                    sx={{
                        display: { xs: "flex" },
                        flexDirection: "row",
                        justifyContent: "space-between"
                    }}>
                    {/* <div>
                        <Switch disabled={true} color={"secondary"} value={hoskyInput} onClick={() => setHoskyInput(!hoskyInput)} />
                        {hoskyInput ? "Hosky" : "General payment"}
                    </div> */}


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
                    <CardanoWallet />
                </Toolbar>
            </AppBar>
        </Box>

    )
}