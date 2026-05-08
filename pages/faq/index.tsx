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
import { useTranslations } from "../../src/lib/i18n/I18nProvider";

type SectionKey = "general" | "hosky" | "tech";

const SECTIONS: { key: SectionKey; questionKeys: string[] }[] = [
    { key: "general", questionKeys: ["q1", "q2", "q3", "q4"] },
    { key: "hosky", questionKeys: ["q1", "q2", "q3", "q4", "q5"] },
    { key: "tech", questionKeys: ["q1", "q2", "q3", "q4"] },
];

const FAQPage = () => {
    const t = useTranslations();

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={1} sx={{ p: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom align="center">
                    {t("faq.title")}
                </Typography>
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
                    {t("faq.subtitle")}
                </Typography>

                {SECTIONS.map((section, sectionIdx) => (
                    <React.Fragment key={section.key}>
                        {sectionIdx > 0 && <Divider sx={{ my: 4 }} />}
                        <Typography
                            variant="h4"
                            component="h2"
                            gutterBottom
                            sx={sectionIdx === 0 ? { mt: 4, mb: 2 } : { mb: 2 }}
                        >
                            {t(`faq.${section.key}.title`)}
                        </Typography>
                        <Box sx={{ mb: 4 }}>
                            {section.questionKeys.map((q) => {
                                const id = `${section.key}-${q}`;
                                return (
                                    <Accordion key={id}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls={`${id}-content`}
                                            id={`${id}-header`}
                                        >
                                            <Typography variant="h6">
                                                {t(`faq.${section.key}.${q}.question`)}
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography>
                                                {t(`faq.${section.key}.${q}.answer`)}
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                );
                            })}
                        </Box>
                    </React.Fragment>
                ))}
            </Paper>
        </Container>
    );
};

export default FAQPage;
