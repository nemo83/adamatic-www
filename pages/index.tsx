import React, { useEffect, useState } from "react";
import { useWallet } from "../src/lib/wallet/useWallet";
import SetupRecurringPayment from "../components/SetupRecurringPayment";
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
        <SetupRecurringPayment isValidNetwork={validNetwork} hoskyInput={true} />
    );
}
