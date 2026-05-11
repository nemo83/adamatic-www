import React from 'react';
import { FormGroup, FormControlLabel, Checkbox, Box } from '@mui/material';
import { useTranslations } from "../../../lib/i18n/I18nProvider";

interface PaymentConfirmationProps {
    acceptRisk: boolean;
    setAcceptRisk: (acceptRisk: boolean) => void;
    acceptFees: boolean;
    setAcceptFees: (acceptFees: boolean) => void;
}

export default function PaymentConfirmation({
    acceptRisk,
    setAcceptRisk,
    acceptFees,
    setAcceptFees,
}: PaymentConfirmationProps) {
    const t = useTranslations();
    return (
        <Box sx={{ mt: 3 }}>
            <FormGroup>
                <FormControlLabel
                    required
                    control={
                        <Checkbox
                            checked={acceptRisk}
                            onChange={() => setAcceptRisk(!acceptRisk)}
                        />
                    }
                    label={t("submit.acceptRisk")}
                />
                <FormControlLabel
                    required
                    control={
                        <Checkbox
                            checked={acceptFees}
                            onChange={() => setAcceptFees(!acceptFees)}
                        />
                    }
                    label={t("submit.acceptFees")}
                />
            </FormGroup>
        </Box>
    );
}
