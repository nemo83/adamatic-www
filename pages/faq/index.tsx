import React from "react";
import { LedgerLayout } from "../../design/layout";

const general = [
    {
        q: "What is AdaMatic?",
        a: "AdaMatic is a decentralized application on Cardano for automated recurring payments. Smart contracts execute scheduled transactions without manual intervention — useful for token collection, subscriptions, or any scheduled transfer.",
    },
    {
        q: "How does it work?",
        a: "You deposit funds into a Plutus smart contract with parameters (amount, frequency, recipient). The system executes these payments on your schedule without requiring your wallet to be connected.",
    },
    {
        q: "Is it secure?",
        a: "Funds are held in the smart contract — not by a centralized entity. You keep control and can cancel any schedule at any time.",
    },
    {
        q: "What are the fees?",
        a: "A small operator fee per transaction plus standard Cardano network fees. All fees are shown up front when you set up a payment.",
    },
];

const hosky = [
    {
        q: "Do I have to connect the wallet delegated to a Hosky pool?",
        a: "No. Use any wallet — we recommend a small hot wallet. List the delegated staking addresses in step 2 and rewards land in those addresses.",
    },
    {
        q: "Where do I receive my Hosky rewards?",
        a: "In the wallet that owns the delegated stake address. Regardless of which wallet signs the schedule, rewards are sent by the Hosky Doggiebowl to the delegated stake.",
    },
    {
        q: "How many auto-pulls can I set up?",
        a: "As many as you want. Keeping them all under one small hot wallet makes them easier to track on your schedules page.",
    },
    {
        q: "When are Hosky rewards claimed?",
        a: "By default ~48 hours from the start of each epoch. Enough time for manual claims if something goes wrong.",
    },
];

const technical = [
    {
        q: "Which wallets are supported?",
        a: "Any CIP-30 wallet: Lace, Eternl, Nami, Typhon, Flint, NuFi, Vespr, etc.",
    },
    {
        q: "Can I cancel a schedule?",
        a: "Yes, anytime. Any remaining funds return to your wallet.",
    },
    {
        q: "What if a payment fails?",
        a: "If insufficient funds, the schedule is marked INSUFFICIENT_FUNDS and does not retry automatically. Top up the contract or cancel and create a new one.",
    },
    {
        q: "Which networks?",
        a: "Preprod for development + Mainnet for production. Make sure your wallet matches the configured network.",
    },
];

function Section({
    title,
    items,
}: {
    title: string;
    items: { q: string; a: string }[];
}) {
    return (
        <div className="flex flex-col gap-4">
            <h2 className="font-display text-[24px] md:text-[28px] font-semibold">
                {title}
            </h2>
            <div className="flex flex-col gap-2">
                {items.map((it, i) => (
                    <details
                        key={i}
                        className="group border border-rule rounded-card open:bg-paper-raised/30 transition-colors"
                    >
                        <summary className="cursor-pointer list-none flex items-center justify-between gap-4 px-4 py-3 text-[15px] font-medium select-none">
                            <span>{it.q}</span>
                            <span
                                aria-hidden
                                className="font-mono text-marginalia transition-transform group-open:rotate-45"
                            >
                                +
                            </span>
                        </summary>
                        <p className="px-4 pb-4 text-[14px] text-ink/80 leading-relaxed">
                            {it.a}
                        </p>
                    </details>
                ))}
            </div>
        </div>
    );
}

function FAQPage() {
    return (
        <LedgerLayout currentPath="/faq">
            <section className="px-4 md:px-8 py-10 md:py-16">
                <div className="max-w-[820px] mx-auto flex flex-col gap-10">
                    <header className="flex flex-col gap-2">
                        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia">
                            Reference
                        </div>
                        <h1 className="font-display text-[40px] md:text-[56px] font-semibold leading-[1.05] tracking-tight">
                            Frequently asked.
                        </h1>
                        <p className="text-[15px] text-marginalia max-w-xl leading-relaxed">
                            Answers to the most common questions about AdaMatic
                            and automated Cardano payments.
                        </p>
                    </header>

                    <Section title="General" items={general} />
                    <Section title="Hosky Doggie Bowl" items={hosky} />
                    <Section title="Technical" items={technical} />
                </div>
            </section>
        </LedgerLayout>
    );
}

(FAQPage as any).standalone = true;
export default FAQPage;
