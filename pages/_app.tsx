import "../design/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { WalletProvider } from "../lib/wallet/WalletProvider";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <WalletProvider>
            <Toaster position="top-right" />
            <Component {...pageProps} />
        </WalletProvider>
    );
}
