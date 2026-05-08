import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Divider,
    Stack,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ReceiptIcon from '@mui/icons-material/Receipt';
import toast from 'react-hot-toast';
import { CONSTANTS } from '../../../lib/cardano/constants';
import { useTranslations } from '../../../lib/i18n/I18nProvider';

interface PaymentReceiptProps {
    payeeAddress: string;
    amountPerPayment: number; // in lovelace
    numPayments: number;
    maxFeesLovelace: number;
    walletAddresses?: string[]; // Optional array of wallet addresses
}

export default function PaymentReceipt({
    payeeAddress,
    amountPerPayment,
    numPayments,
    maxFeesLovelace,
    walletAddresses = []
}: PaymentReceiptProps) {
    const t = useTranslations();

    const totalPaymentAmount = amountPerPayment * numPayments * walletAddresses.length;
    const totalProtocolFees = maxFeesLovelace * numPayments * walletAddresses.length;

    // Use the actual total deposit amount instead of calculating it
    const grandTotal = totalPaymentAmount + totalProtocolFees;

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(t('receipt.addressCopied'));
        } catch (error) {
            toast.error(t('receipt.copyFailed'));
        }
    };

    const formatAda = (lovelace: number) => {
        return (lovelace / CONSTANTS.ADA_CONVERSION).toFixed(2) + ' ADA';
    };

    return (
        <Card sx={{ 
            mt: 3, 
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 203, 243, 0.05) 100%)',
            border: '1px solid rgba(33, 150, 243, 0.2)'
        }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                        {t('receipt.title')}
                    </Typography>
                </Box>

                <Stack spacing={2}>
                    {/* Payee Address */}
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {t('receipt.payeeAddress')}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ 
                                fontFamily: 'monospace',
                                wordBreak: 'break-all',
                                flex: 1
                            }}>
                                {payeeAddress.substring(0, 20)}...{payeeAddress.substring(payeeAddress.length - 20)}
                            </Typography>
                            <Tooltip title={t('receipt.copyAddress')}>
                                <IconButton 
                                    size="small" 
                                    onClick={() => copyToClipboard(payeeAddress)}
                                    sx={{ ml: 1 }}
                                >
                                    <ContentCopyIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {/* Wallet Addresses (if multiple) */}
                    {walletAddresses.length > 1 && (
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {t('receipt.walletAddresses', { n: walletAddresses.length })}
                            </Typography>
                            {walletAddresses.map((address, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Typography variant="body2" sx={{ 
                                        fontFamily: 'monospace',
                                        wordBreak: 'break-all',
                                        flex: 1,
                                        fontSize: '0.75rem'
                                    }}>
                                        {index + 1}. {address.substring(0, 15)}...{address.substring(address.length - 15)}
                                    </Typography>
                                    <Tooltip title={t('receipt.copyAddress')}>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => copyToClipboard(address)}
                                        >
                                            <ContentCopyIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            ))}
                        </Box>
                    )}

                    <Divider />

                    {/* Payment Details */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {t('receipt.amountPerPayment')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatAda(amountPerPayment)}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {t('receipt.numPayments')}
                        </Typography>
                        <Chip 
                            label={numPayments} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                        />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {t('receipt.protocolFeesMax')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatAda(maxFeesLovelace)}
                        </Typography>
                    </Box>

                    <Divider />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {t('receipt.totalPaymentAmount')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatAda(totalPaymentAmount)}
                        </Typography>
                    </Box>

                    {/* Fees */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {t('receipt.totalProtocolFeesMax')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatAda(totalProtocolFees)}
                        </Typography>
                    </Box>


                    <Divider sx={{ borderStyle: 'dashed' }} />

                    {/* Grand Total */}
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        borderRadius: '8px',
                        p: 2
                    }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {t('receipt.totalToDeposit')}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {formatAda(grandTotal)}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}