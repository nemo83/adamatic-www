import {AppBar, Box, CssBaseline, Link, makeStyles, Toolbar, Typography} from "@mui/material";
import {CardanoWallet, useWallet} from "@meshsdk/react";
import {BrowserWallet} from "@meshsdk/core";
import React, {useState} from "react";
import "@meshsdk/react/styles.css";

export default function Navbar(props: {network : string, isValidNetwork : boolean}) {
    const { connected } = useWallet();

    const { network, isValidNetwork } = props;

    return (
        <Box>
            <AppBar position="static" component="nav">
                {/*<CssBaseline />*/}
                <Toolbar disableGutters
                         sx={{
                             display: { xs: "flex" },
                             flexDirection: "row",
                             justifyContent: "space-between"
                         }}>
                    <Typography variant="h6" >
                        Cardano recurring payments
                    </Typography>
                    <Typography>{isValidNetwork ? connected ? network : <>Network from wallet not supporter</> : <></>}</Typography>
                    <CardanoWallet />
                </Toolbar>
            </AppBar>
        </Box>

    )
}