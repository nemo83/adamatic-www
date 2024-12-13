

import { Accordion, AccordionDetails, AccordionSummary, Box } from "@mui/material";
import React, { useState } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


const faqs = [{
    aria: "panel1-content",
    id: "panel1-header",
    question: "Do I need to necessarily use the wallet delegated to a Hosky Rugpool?",
    answer: "No! You can use any wallet to setup payments. In fact the recommendation is to use a small hot wallet, " +
        " and to set up in the \'Payment or Staking reward address\' the address of the wallet you want to collect the rewards for."
}, {
    aria: "panel2-content",
    id: "panel2-header",
    question: "Where will I receive my Hosky rewards?",
    answer: "You will receive the Hosky rewards in the wallet you claimed the rewards for. In fact, regardless of whether you used the delegated wallet or " +
        "a different small hot wallet, rewards will be sent by the Hosky Doggiebowl to the address of the delegated wallet."
}, {
    aria: "panel3-content",
    id: "panel3-header",
    question: "How many automatic pulls can I setup?",
    answer: "You can setup as many auto-pulls as you want. Recommendation would be to set them up all from the same small hot wallet, so they will appear to you " +
        "all together in the adamatic payment page"
}, {
    aria: "panel4-content",
    id: "panel4-header",
    question: "I have a small wallet, how can I still make it worth to pull rewards?",
    answer: "Hosky Doggie bowl allows rewards to stack up to a certain amount. Adamatic allows you to set the pull frequency in term of epochs. " +
        "We recommend to make your own calculations to come up with the ideal epoch frequency!"
}]

const HoskyFAQ = () => {


    return (
        <Box>
            {faqs.map((faq) => (
                <Accordion key={faq.id}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={faq.aria}
                        id={faq.id}
                    >
                        {faq.question}
                    </AccordionSummary>
                    <AccordionDetails>
                        {faq.answer}
                    </AccordionDetails>
                </Accordion>))}
        </Box>

    )

}

export default HoskyFAQ;
