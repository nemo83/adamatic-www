import React, { useEffect, useState } from "react";
import { useWallet } from "../src/lib/wallet/useWallet";
import SetupPage from "../src/features/setup-payment/components/SetupPage";
import { NETWORK_ID } from "../src/lib/cardano/constants";


export default function Home() {

    const { connected, networkId } = useWallet();

    const [validNetwork, setValidNetwork] = useState<boolean>(false);

    useEffect(() => {
        if (connected && networkId !== null) {
            setValidNetwork(String(networkId) === NETWORK_ID);
        }
    }, [connected, networkId]);

    return (
        <SetupPage isValidNetwork={validNetwork} mode="hosky" />
    );
}
