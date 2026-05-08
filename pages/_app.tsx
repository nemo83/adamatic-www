import "../styles/globals.css";
import type { AppProps } from "next/app";

import React, { useMemo } from "react";
import { WalletProvider } from "../src/lib/wallet/WalletProvider";
import { ScriptProvider } from "../src/lib/cardano/ScriptContext";
import { I18nProvider, useTranslations } from "../src/lib/i18n/I18nProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { TourProvider } from "@reactour/tour";
import Layout from "../components/Layout";

const theme = createTheme({
    palette: {
        mode: "light",
    },
});

/**
 * Reactour walks the user through the setup flow on first connect. Steps
 * anchor to `data-tut="step-…"` attributes on the components. The Delegate
 * step (`step-delegate`) is contextual — only present when the wallet is
 * not delegated to a Hosky pool. Reactour skips selectors that don't
 * resolve to a DOM node, so users who are already delegated breeze past
 * that step automatically.
 */
function TourBoundary({ children }: { children: React.ReactNode }) {
    const t = useTranslations();
    const steps = useMemo(
        () => [
            { selector: '[data-tut="step-welcome"]', content: t("tour.welcome") },
            { selector: '[data-tut="step-0"]', content: t("tour.wallet") },
            { selector: '[data-tut="step-1"]', content: t("tour.addresses") },
            { selector: '[data-tut="step-delegate"]', content: t("tour.delegate") },
            { selector: '[data-tut="step-3"]', content: t("tour.maxFees") },
            { selector: '[data-tut="step-5"]', content: t("tour.firstEpoch") },
            { selector: '[data-tut="step-6"]', content: t("tour.lastEpoch") },
            { selector: '[data-tut="step-7"]', content: t("tour.numPulls") },
            { selector: '[data-tut="step-8"]', content: t("tour.frequency") },
        ],
        [t],
    );
    return <TourProvider steps={steps}>{children}</TourProvider>;
}

export default function App({ Component, pageProps }: AppProps) {
    return (
        <I18nProvider>
            <WalletProvider>
                <ScriptProvider>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TourBoundary>
                                <Layout>
                                    <Component {...pageProps} />
                                </Layout>
                            </TourBoundary>
                        </LocalizationProvider>
                    </ThemeProvider>
                </ScriptProvider>
            </WalletProvider>
        </I18nProvider>
    );
}
