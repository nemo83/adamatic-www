import React from 'react';
import { FormGroup, FormControlLabel, Checkbox, Box, Typography } from '@mui/material';

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
    setAcceptFees
}: PaymentConfirmationProps) {
    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Confirmation
            </Typography>
            <FormGroup>
                <FormControlLabel 
                    required 
                    control={
                        <Checkbox 
                            checked={acceptRisk}
                            onChange={() => setAcceptRisk(!acceptRisk)}
                        />
                    } 
                    label="I accept to use this tool at my own risk"
                />
                <FormControlLabel 
                    required 
                    control={
                        <Checkbox 
                            checked={acceptFees}
                            onChange={() => setAcceptFees(!acceptFees)}
                        />
                    } 
                    label="I accept to pay required transaction and protocol fees to setup my automated payments"
                />
            </FormGroup>
        </Box>
    );
}