import React from "react";
import { 
    Container, 
    Typography, 
    Accordion, 
    AccordionDetails, 
    AccordionSummary, 
    Box,
    Divider,
    Paper
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const generalFaqs = [
    {
        aria: "general1-content",
        id: "general1-header",
        question: "What is AdaMatic?",
        answer: "AdaMatic is a decentralized application built on Cardano that enables automated recurring payments. It uses smart contracts to execute scheduled transactions without manual intervention, perfect for regular payments like token collection, subscriptions, or any recurring transfers."
    },
    {
        aria: "general2-content",
        id: "general2-header",
        question: "How does AdaMatic work?",
        answer: "AdaMatic uses Plutus smart contracts on the Cardano blockchain. You deposit funds into a smart contract with specific payment parameters (amount, frequency, recipient). The system then automatically executes these payments according to your schedule without requiring your wallet to be connected."
    },
    {
        aria: "general3-content",
        id: "general3-header",
        question: "Is AdaMatic secure?",
        answer: "Yes, AdaMatic is built on Cardano's secure blockchain infrastructure using Plutus smart contracts. Your funds are held in smart contracts, not by any centralized entity. You maintain full control and can cancel payments at any time."
    },
    {
        aria: "general4-content",
        id: "general4-header",
        question: "What are the fees?",
        answer: "AdaMatic charges a small operator fee per transaction plus standard Cardano network fees. The exact fees are displayed when you set up a payment. All fees are transparent and shown upfront."
    }
];

const hoskyFaqs = [
    {
        aria: "hosky1-content",
        id: "hosky1-header",
        question: "Do I need to necessarily use the wallet delegated to a Hosky Rugpool?",
        answer: "No! You can use any wallet to setup payments. In fact the recommendation is to use a small hot wallet, and to set up in the 'Payment or Staking reward address' the address of the wallet you want to collect the rewards for."
    },
    {
        aria: "hosky2-content",
        id: "hosky2-header",
        question: "Where will I receive my Hosky rewards?",
        answer: "You will receive the Hosky rewards in the wallet you claimed the rewards for. In fact, regardless of whether you used the delegated wallet or a different small hot wallet, rewards will be sent by the Hosky Doggiebowl to the address of the delegated wallet."
    },
    {
        aria: "hosky3-content",
        id: "hosky3-header",
        question: "How many automatic pulls can I setup?",
        answer: "You can setup as many auto-pulls as you want. Recommendation would be to set them up all from the same small hot wallet, so they will appear to you all together in the adamatic payment page."
    },
    {
        aria: "hosky4-content",
        id: "hosky4-header",
        question: "I have a small wallet, how can I still make it worth to pull rewards?",
        answer: "Hosky Doggie bowl allows rewards to stack up to a certain amount. AdaMatic allows you to set the pull frequency in terms of epochs. We recommend to make your own calculations to come up with the ideal epoch frequency!"
    },
    {
        aria: "hosky5-content",
        id: "hosky5-header",
        question: "At what time are the Hosky rewards claimed?",
        answer: "By default, and for the time being, AdaMatic is configured to sent the 2 ada payments to the Hosky doggie bowl about 48 hours from the beginning of the epoch. This gives enough time to Hosky to get their poop together and to users to manually claim rewards in case of issues."
    }
];

const technicalFaqs = [
    {
        aria: "tech1-content",
        id: "tech1-header",
        question: "Which wallets are supported?",
        answer: "AdaMatic supports all major Cardano wallets including Lace, Eternl, Flint, and other CIP-30 compatible wallets. The integration uses MeshSDK for broad wallet compatibility."
    },
    {
        aria: "tech2-content",
        id: "tech2-header",
        question: "Can I cancel a recurring payment?",
        answer: "Yes, you can cancel any recurring payment at any time. Simply go to your payments list, find the payment you want to cancel, and click the cancel button. Any remaining funds will be returned to your wallet."
    },
    {
        aria: "tech3-content",
        id: "tech3-header",
        question: "What happens if my payment fails?",
        answer: "If a payment fails (e.g., due to insufficient funds), the system will mark it as failed and won't retry automatically. You can add more funds to the contract or cancel and create a new payment with adequate funding."
    },
    {
        aria: "tech4-content",
        id: "tech4-header",
        question: "Which networks does AdaMatic support?",
        answer: "AdaMatic currently supports Cardano Preprod testnet for development and testing. Mainnet support is available for production use. Make sure your wallet is connected to the correct network."
    }
];

const FAQPage = () => {
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={1} sx={{ p: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom align="center">
                    Frequently Asked Questions
                </Typography>
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
                    Find answers to common questions about AdaMatic and automated Cardano payments
                </Typography>

                {/* General Questions */}
                <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                    General Questions
                </Typography>
                <Box sx={{ mb: 4 }}>
                    {generalFaqs.map((faq) => (
                        <Accordion key={faq.id}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={faq.aria}
                                id={faq.id}
                            >
                                <Typography variant="h6">{faq.question}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>{faq.answer}</Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Hosky-Specific Questions */}
                <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 2 }}>
                    Hosky Token Questions
                </Typography>
                <Box sx={{ mb: 4 }}>
                    {hoskyFaqs.map((faq) => (
                        <Accordion key={faq.id}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={faq.aria}
                                id={faq.id}
                            >
                                <Typography variant="h6">{faq.question}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>{faq.answer}</Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Technical Questions */}
                <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 2 }}>
                    Technical Questions
                </Typography>
                <Box>
                    {technicalFaqs.map((faq) => (
                        <Accordion key={faq.id}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={faq.aria}
                                id={faq.id}
                            >
                                <Typography variant="h6">{faq.question}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>{faq.answer}</Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            </Paper>
        </Container>
    );
};

export default FAQPage;