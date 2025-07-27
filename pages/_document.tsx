import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* Favicon */}
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                
                {/* Apple Touch Icon */}
                <link rel="apple-touch-icon" sizes="180x180" href="/favicon-32x32.png" />
                
                {/* Manifest for PWA */}
                <link rel="manifest" href="/site.webmanifest" />
                
                {/* Meta tags */}
                <meta name="theme-color" content="#2196F3" />
                <meta name="description" content="AdaMatic - Automate your Cardano payments with smart contracts. Perfect for Hosky token collection and recurring transactions." />
                <meta name="keywords" content="Cardano, AdaMatic, recurring payments, automation, Hosky, blockchain, smart contracts, DeFi, Web3" />
                <meta name="author" content="Easy1Staking" />
                <meta name="robots" content="index, follow" />
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="AdaMatic" />
                <meta property="og:title" content="AdaMatic - Automate Your Cardano Payments" />
                <meta property="og:description" content="Set up recurring payments on Cardano with smart contracts. Perfect for Hosky token collection, subscriptions, and any scheduled transactions. Secure, automated, and cost-effective." />
                <meta property="og:image" content="/og-image-1200x630.png" />
                <meta property="og:image:alt" content="AdaMatic - Automate Your Cardano Payments with Smart Contracts" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:type" content="image/png" />
                <meta property="og:locale" content="en_US" />
                <meta property="og:url" content="https://adamatic.vercel.app" />
                
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@AdaMatic" />
                <meta name="twitter:creator" content="@Easy1Staking" />
                <meta name="twitter:title" content="AdaMatic - Automate Your Cardano Payments" />
                <meta name="twitter:description" content="Set up recurring payments on Cardano with smart contracts. Secure, automated, and cost-effective solution for Hosky collection and more." />
                <meta name="twitter:image" content="/og-image-1200x630.png" />
                <meta name="twitter:image:alt" content="AdaMatic - Automate Your Cardano Payments" />
                
                {/* LinkedIn */}
                <meta property="og:image:secure_url" content="/og-image-1200x630.png" />
                
                {/* Additional social platforms */}
                <meta property="article:author" content="Easy1Staking" />
                <meta property="article:section" content="Technology" />
                <meta property="article:tag" content="Cardano" />
                <meta property="article:tag" content="DeFi" />
                <meta property="article:tag" content="Smart Contracts" />
                <meta property="article:tag" content="Automation" />
                
                {/* Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebApplication",
                            "name": "AdaMatic",
                            "url": "https://adamatic.vercel.app",
                            "description": "AdaMatic - Automate your Cardano payments with smart contracts. Perfect for Hosky token collection and recurring transactions.",
                            "applicationCategory": "FinanceApplication",
                            "operatingSystem": "Web Browser",
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD"
                            },
                            "author": {
                                "@type": "Organization",
                                "name": "Easy1Staking",
                                "url": "https://easy1staking.com"
                            },
                            "provider": {
                                "@type": "Organization",
                                "name": "Easy1Staking",
                                "url": "https://easy1staking.com"
                            },
                            "keywords": ["Cardano", "recurring payments", "smart contracts", "automation", "Hosky", "DeFi"],
                            "softwareVersion": "beta",
                            "image": "/og-image-1200x630.png"
                        })
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