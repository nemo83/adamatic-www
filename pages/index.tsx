import React, { useEffect, useState } from "react";
import { useWallet } from "@meshsdk/react";
import SetupRecurringPayment from "../components/SetupRecurringPayment";
import Navbar from "../components/Navbar";
import { NETWORK, NETWORK_ID } from "../lib/util/Constants";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {

    const { wallet, connected } = useWallet();

    const [validNetwork, setValidNetwork] = useState<boolean>(false);

    useEffect(() => {
        if (connected) {
            wallet.getNetworkId().then((id) => {
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

    return (
        <div>
            <Toaster />
            <Navbar />
            <SetupRecurringPayment isValidNetwork={validNetwork} hoskyInput={true} />
        </div>
    );
}
