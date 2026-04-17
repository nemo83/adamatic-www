import "../design/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { WalletProvider } from "../lib/wallet/WalletProvider";
import { ScriptProvider } from "../lib/cardano/ScriptContext";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <WalletProvider>
            <ScriptProvider>
                <Toaster position="top-right" />
                <Component {...pageProps} />
            </ScriptProvider>
        </WalletProvider>
    );
}
