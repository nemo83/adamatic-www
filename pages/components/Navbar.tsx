import {AppBar, Box, CssBaseline, Link, makeStyles, Toolbar, Typography} from "@mui/material";
import {CardanoWallet, useWallet} from "@meshsdk/react";
import {BrowserWallet} from "@meshsdk/core";
import React, {useState} from "react";
import "@meshsdk/react/styles.css";

export default function Navbar() {
    const { name } = useWallet();

    const [network, setNetwork] = useState("");


    async function walletConnected() {

        const browserWallet = await BrowserWallet.enable(name);
        browserWallet.getNetworkId().then(value => {
            switch (value) {
                case 0:
                    setNetwork("Testnet")
                    break;
                case 1:
                    setNetwork("Mainnet")
                    break;
                default:
                    setNetwork("Unknown")
            }
        });
    }


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
                    <CardanoWallet />
                </Toolbar>
            </AppBar>
        </Box>

    )
}