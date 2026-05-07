import React, { useEffect, useState } from "react";
import { useWallet } from "../src/lib/wallet/useWallet";
import SetupRecurringPayment from "../components/SetupRecurringPayment";
import { NETWORK_ID } from "../src/lib/cardano/constants";


export default function Home() {

    const { wallet, connected } = useWallet();

    const [validNetwork, setValidNetwork] = useState<boolean>(false);

    useEffect(() => {
        if (connected) {
            wallet.getNetworkId().then((id: number) => {
                const isValidNetwork = String(id) == NETWORK_ID
                setValidNetwork(isValidNetwork);
            });
        }
    }, [connected]);

    return (
        <SetupRecurringPayment isValidNetwork={validNetwork} hoskyInput={true} />
    );
}
