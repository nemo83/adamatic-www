import React, {useEffect, useState} from "react";
import { useWallet } from "@meshsdk/react";
import SetupRecurringPayment from "../components/SetupRecurringPayment";
import Navbar from "../components/Navbar";
import TransactionUtil from "../lib/util/TransactionUtil";
import {SCRIPT} from "../lib/util/Constants";

export default function Home() {

    const { wallet, connected } = useWallet();

    const [network, setNetwork] = useState("" as string);
    const [networkID, setNetworkID] = useState(0 as number);
    const [validNetwork, setValidNetwork] = useState(false as boolean);
    const [scriptAddress, setScriptAddress] = useState("" as string);
    const [hoskyInput, setHoskyInput] = useState(true as boolean);

    useEffect(() => {
        if (connected) {
            wallet.getNetworkId().then((id) => {
                setNetworkID(id);
                // @ts-ignore
                if(id === +process.env.NEXT_PUBLIC_NETWORK) {
                    console.log("Network is valid")
                    setValidNetwork(true);
                    TransactionUtil.getScriptAddressWithStakeCredential(wallet, SCRIPT).then((address) => {
                        setScriptAddress(address);
                    });
                } else {
                    console.log("Network is invalid")
                    setNetworkID(id);
                    setValidNetwork(false);

                }
            });
        }
    }, [wallet, connected]);

    useEffect(() => {
        setNetwork(networkID == 0 ? "Testnet" : "Mainnet");
    }, [networkID]);

    return (
        <>
            <Navbar network={network} isValidNetwork={validNetwork} hoskyInput={hoskyInput} setHoskyInput={setHoskyInput}/>
            <SetupRecurringPayment scriptAddress={scriptAddress} hoskyInput={hoskyInput} />
        </>
    );
}
