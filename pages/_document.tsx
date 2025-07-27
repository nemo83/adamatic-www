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
                <meta name="keywords" content="Cardano, AdaMatic, recurring payments, automation, Hosky, blockchain, smart contracts" />
                
                {/* Open Graph */}
                <meta property="og:title" content="AdaMatic - Automate Your Cardano Payments" />
                <meta property="og:description" content="Set up recurring payments on Cardano with smart contracts. Perfect for Hosky token collection and scheduled transactions." />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="/favicon-32x32.png" />
                
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="AdaMatic - Automate Your Cardano Payments" />
                <meta name="twitter:description" content="Set up recurring payments on Cardano with smart contracts." />
                <meta name="twitter:image" content="/favicon-32x32.png" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}