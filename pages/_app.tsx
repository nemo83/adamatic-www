import "../styles/globals.css";
import type { AppProps } from "next/app";

import React, { useMemo } from "react";
import Head from "next/head";
import { WalletProvider } from "../src/lib/wallet/WalletProvider";
import { ScriptProvider } from "../src/lib/cardano/ScriptContext";
import { I18nProvider, useI18n } from "../src/lib/i18n/I18nProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { TourProvider } from "@reactour/tour";
import Layout from "../components/Layout";

/**
 * Default site-wide title / description / OG / Twitter meta tags. Each
 * carries a `key` matching its `property` or `name` so per-page Head
 * components in `next/head` can override individual entries via the same
 * key. This is the only way to get clean per-page social cards — meta
 * tags emitted from `_document.tsx` can't be deduped by `next/head`.
 */
const DEFAULT_TITLE = "AdaMatic — Automate your Cardano payments";
const DEFAULT_DESCRIPTION =
    "Set up recurring payments on Cardano with smart contracts. Perfect for Hosky token collection, subscriptions, and any scheduled transactions. Secure, automated, and cost-effective.";
const DEFAULT_OG_IMAGE = "/og-image-1200x630.png";

function DefaultSiteHead() {
    return (
        <Head>
            <title key="title">{DEFAULT_TITLE}</title>
            <meta name="description" content={DEFAULT_DESCRIPTION} key="description" />
            <meta property="og:type" content="website" key="og:type" />
            <meta property="og:site_name" content="AdaMatic" key="og:site_name" />
            <meta property="og:title" content={DEFAULT_TITLE} key="og:title" />
            <meta property="og:description" content={DEFAULT_DESCRIPTION} key="og:description" />
            <meta property="og:image" content={DEFAULT_OG_IMAGE} key="og:image" />
            <meta property="og:image:secure_url" content={DEFAULT_OG_IMAGE} key="og:image:secure_url" />
            <meta property="og:image:alt" content="AdaMatic — Automate your Cardano payments" key="og:image:alt" />
            <meta property="og:image:width" content="1200" key="og:image:width" />
            <meta property="og:image:height" content="630" key="og:image:height" />
            <meta property="og:image:type" content="image/png" key="og:image:type" />
            <meta property="og:locale" content="en_US" key="og:locale" />
            <meta name="twitter:card" content="summary_large_image" key="twitter:card" />
            <meta name="twitter:site" content="@AdaMatic" key="twitter:site" />
            <meta name="twitter:creator" content="@Easy1Staking" key="twitter:creator" />
            <meta name="twitter:title" content={DEFAULT_TITLE} key="twitter:title" />
            <meta name="twitter:description" content={DEFAULT_DESCRIPTION} key="twitter:description" />
            <meta name="twitter:image" content={DEFAULT_OG_IMAGE} key="twitter:image" />
            <meta name="twitter:image:alt" content="AdaMatic — Automate your Cardano payments" key="twitter:image:alt" />
        </Head>
    );
}

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
    const { locale, t } = useI18n();
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
    // `key={locale}` forces TourProvider to remount when the locale changes —
    // Reactour reads its `steps` prop only at mount, so a re-render with new
    // strings doesn't propagate without a remount.
    return (
        <TourProvider key={locale} steps={steps}>
            {children}
        </TourProvider>
    );
}

export default function App({ Component, pageProps }: AppProps) {
    return (
        <I18nProvider>
            <DefaultSiteHead />
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
