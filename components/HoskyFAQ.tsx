import { Accordion, AccordionDetails, AccordionSummary, Box } from "@mui/material";
import React from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslations } from "../src/lib/i18n/I18nProvider";

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5"] as const;

const HoskyFAQ = () => {
    const t = useTranslations();

    return (
        <Box>
            {FAQ_KEYS.map((k) => (
                <Accordion key={k}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`${k}-content`}
                        id={`${k}-header`}>
                        {t(`faq.hosky.${k}.question`)}
                    </AccordionSummary>
                    <AccordionDetails>
                        {t(`faq.hosky.${k}.answer`)}
                    </AccordionDetails>
                </Accordion>))}
        </Box>
    )
}

export default HoskyFAQ;
