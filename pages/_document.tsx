import { Html, Head, Main, NextScript } from "next/document";

/**
 * Document is rendered once at SSR start; it owns the static HTML shell
 * (favicons, manifest, structured data). Per-request meta tags — title,
 * description, OG, Twitter — live in `_app.tsx` (defaults) and individual
 * page components (overrides via `next/head`'s key-based dedup).
 */
export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* Favicons */}
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/favicon-32x32.png" />

                {/* PWA manifest + theme */}
                <link rel="manifest" href="/site.webmanifest" />
                <meta name="theme-color" content="#2196F3" />

                {/* Fonts — loaded site-wide from `_document.tsx` so Next doesn't
                     flag the per-page import in `<HoskyDelegationModal>`. */}
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..900,0..100;1,9..144,300..900,0..100&family=DM+Sans:opsz,wght@9..40,300..700&family=JetBrains+Mono:wght@400..600&display=swap"
                />

                {/* Static SEO bits that don't change per page */}
                <meta name="keywords" content="Cardano, AdaMatic, recurring payments, automation, Hosky, blockchain, smart contracts, DeFi, Web3" />
                <meta name="author" content="Easy1Staking" />
                <meta name="robots" content="index, follow" />

                {/* Structured data — global, generic site description */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebApplication",
                            name: "AdaMatic",
                            url: "https://adamatic.xyz",
                            description:
                                "AdaMatic - Automate your Cardano payments with smart contracts. Perfect for Hosky token collection and recurring transactions.",
                            applicationCategory: "FinanceApplication",
                            operatingSystem: "Web Browser",
                            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                            author: {
                                "@type": "Organization",
                                name: "Easy1Staking",
                                url: "https://easy1staking.com",
                            },
                            provider: {
                                "@type": "Organization",
                                name: "Easy1Staking",
                                url: "https://easy1staking.com",
                            },
                            keywords: [
                                "Cardano",
                                "recurring payments",
                                "smart contracts",
                                "automation",
                                "Hosky",
                                "DeFi",
                            ],
                            softwareVersion: "beta",
                            image: "/og-image-1200x630.png",
                        }),
                    }}
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
