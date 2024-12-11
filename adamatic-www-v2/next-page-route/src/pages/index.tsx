import React, { useEffect, useState } from "react";
import { useWallet } from "@meshsdk/react";
import SetupRecurringPayment from "../components/SetupRecurringPayment";
import Navbar from "../components/Navbar";
import { ADAMATIC_HOST, NETWORK, NETWORK_ID, SCRIPT } from "../lib/util/Constants";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {

    const { wallet, connected } = useWallet();

    const [network, setNetwork] = useState<string>("");
    const [networkID, setNetworkID] = useState<number>(0);
    const [validNetwork, setValidNetwork] = useState<boolean>(false);
    const [scriptAddress, setScriptAddress] = useState<string>("");
    const [hoskyInput, setHoskyInput] = useState<boolean>(true);

    useEffect(() => {
        if (connected) {
            wallet.getNetworkId().then((id) => {
                setNetworkID(id);
                const isValidNetwork = String(id) == NETWORK_ID
                setValidNetwork(isValidNetwork);
                if (isValidNetwork) {
                    console.log("Connected to correct network");
                    toast.success("Wallet correctly connected");
                } else {
                    console.log("Trying to connect to wrong network: " + NETWORK);
                    toast.error("Trying to connect to wrong network, please connect to " + NETWORK);
                }
            });
        }
    }, [wallet, connected]);

    useEffect(() => {
        setNetwork(parseInt(NETWORK_ID!) == 0 ? "Testnet" : "Mainnet");
    }, [NETWORK_ID]);

    return (
        <div>
            <Toaster />
            <Navbar network={network} isValidNetwork={validNetwork} hoskyInput={hoskyInput} setHoskyInput={setHoskyInput} />
            <SetupRecurringPayment isValidNetwork={validNetwork} hoskyInput={hoskyInput} />
        </div>
    );
}
