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
                <Toolbar disableGutters
                    sx={{
                        display: { xs: "flex" },
                        flexDirection: "row",
                        justifyContent: "space-between"
                    }}>
                    <div>
                        <Switch disabled={true} color={"secondary"} value={hoskyInput} onClick={() => setHoskyInput(!hoskyInput)} />
                        {hoskyInput ? "Hosky" : "General payment"}
                    </div>

                    {connected ?
                        isValidNetwork ? <Typography>{network}</Typography> : <Typography>Wrong wallet network</Typography>
                        : <Typography>{network}</Typography>}
                    <CardanoWallet />
                </Toolbar>
            </AppBar>
        </Box>

    )
}