/**
 * HOSKY auto-pull setup route.
 *
 * Replaces what `pages/index.tsx` used to mount directly (`<SetupPage mode="hosky">`).
 * Now lives at /setup/hosky so:
 *   - `/` can serve a chooser landing (HOSKY vs generic),
 *   - this route can carry its own per-page OG card (see /api/og/setup/hosky).
 *
 * `getServerSideProps` derives the absolute origin from the request — Twitter's
 * crawler requires absolute URLs for `og:image`, so this can't be inferred
 * client-side. The social-cards skill (easy1staking-dev-skills) covers the
 * crawler-quirk background.
 */
import type { GetServerSideProps } from "next";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useWallet } from "../../src/lib/wallet/useWallet";
import SetupPage from "../../src/features/setup-payment/components/SetupPage";
import { NETWORK_ID } from "../../src/lib/cardano/constants";
import { useTranslations } from "../../src/lib/i18n/I18nProvider";

interface Props {
    baseUrl: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const fwdProto = ctx.req.headers["x-forwarded-proto"];
    const proto =
        typeof fwdProto === "string"
            ? fwdProto.split(",")[0].trim()
            : Array.isArray(fwdProto)
                ? fwdProto[0]
                : ctx.req.headers.host?.startsWith("localhost")
                    ? "http"
                    : "https";
    const host = ctx.req.headers.host ?? "";
    const baseUrl = host ? `${proto}://${host}` : "";
    return { props: { baseUrl } };
};

export default function SetupHoskyRoute({ baseUrl }: Props) {
    const t = useTranslations();
    const { connected, networkId } = useWallet();
    const [validNetwork, setValidNetwork] = useState<boolean>(false);

    useEffect(() => {
        if (connected && networkId !== null) {
            setValidNetwork(String(networkId) === NETWORK_ID);
        }
    }, [connected, networkId]);

    const title = `${t("landing.hosky.title")} · AdaMatic`;
    const description = t("landing.hosky.body");
    const ogUrl = `${baseUrl}/api/og/setup/hosky`;
    const pageUrl = `${baseUrl}/setup/hosky`;

    return (
        <>
            <Head>
                <title key="title">{title}</title>
                <meta name="description" content={description} key="description" />
                <meta property="og:title" content={title} key="og:title" />
                <meta property="og:description" content={description} key="og:description" />
                <meta property="og:type" content="website" key="og:type" />
                <meta property="og:url" content={pageUrl} key="og:url" />
                <meta property="og:image" content={ogUrl} key="og:image" />
                <meta property="og:image:secure_url" content={ogUrl} key="og:image:secure_url" />
                <meta property="og:image:alt" content="AdaMatic — HOSKY auto-pulls" key="og:image:alt" />
                <meta property="og:image:width" content="1200" key="og:image:width" />
                <meta property="og:image:height" content="630" key="og:image:height" />
                <meta property="og:image:type" content="image/png" key="og:image:type" />
                <meta name="twitter:card" content="summary_large_image" key="twitter:card" />
                <meta name="twitter:title" content={title} key="twitter:title" />
                <meta name="twitter:description" content={description} key="twitter:description" />
                <meta name="twitter:image" content={ogUrl} key="twitter:image" />
                <meta name="twitter:image:alt" content="AdaMatic — HOSKY auto-pulls" key="twitter:image:alt" />
            </Head>
            <SetupPage isValidNetwork={validNetwork} mode="hosky" />
        </>
    );
}
