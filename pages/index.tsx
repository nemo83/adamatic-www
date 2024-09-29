import React, {useEffect, useState} from "react";
import {CardanoWallet, useWallet} from "@meshsdk/react";
import {
    AppBar,
    Box,
    Toolbar, Typography,
} from "@mui/material";
import SetupRecurringPayment from "../components/SetupRecurringPayment";
import Navbar from "../components/Navbar";
import TransactionUtil from "../lib/util/TransactionUtil";
import {SCRIPT} from "../lib/util/Constants";
import {Data} from "@meshsdk/core";
import PaymentsTable from "../components/PaymentsTable";
import RecurringPaymentDatum from "../lib/interfaces/RecurringPaymentDatum";

export default function Home() {

    const { wallet, connected } = useWallet();

    const [network, setNetwork] = useState("" as string);
    const [networkID, setNetworkID] = useState(0 as number);
    const [validNetwork, setValidNetwork] = useState(false as boolean);
    const [scriptAddress, setScriptAddress] = useState("" as string);


    useEffect(() => {
        if (connected) {
            wallet.getNetworkId().then((id) => {
                setNetworkID(id);
                setNetwork(networkID == 0 ? "Testnet" : "Mainnet")
                // @ts-ignore
                if(id === +process.env.NEXT_PUBLIC_NETWORK) {
                    console.log("Network is valid")
                    setValidNetwork(true);
                } else {
                    console.log("Network is invalid")
                    setNetworkID(id);
                    setValidNetwork(false);

                }
            });
        }
    }, [wallet]);

    useEffect(() => {
        if (connected) {
            wallet.getNetworkId().then((id) => {
                if(validNetwork) {
                    TransactionUtil.getScriptAddressWithStakeCredential(wallet, SCRIPT).then((address) => {
                        setScriptAddress(address);

                    });
                }
            });
        }
    }, [validNetwork]);

    return (
        <>
            <Navbar network={network} isValidNetwork={validNetwork}/>

            <SetupRecurringPayment scriptAddress={scriptAddress} />
        </>
    );
}
