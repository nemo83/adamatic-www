import { Box, Typography } from "@mui/material";
import { 
    Card, 
    CardContent, 
    Chip,
    Container,
    Divider ,
    Stack
} from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import SavingsIcon from '@mui/icons-material/Savings';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

import React from "react";

const Hero = () => {


    return (
       
                    
                    <Box sx={{ 
                        textAlign: 'center', 
                        mb: 6,
                        mt: 2,
                        background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 203, 243, 0.05) 100%)',
                        borderRadius: 3,
                        p: 4,
                        border: '1px solid rgba(33, 150, 243, 0.1)'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                            <AutorenewIcon sx={{ 
                                fontSize: '3rem', 
                                color: 'primary.main',
                                mr: 2
                            }} />
                            <Typography 
                                variant="h2" 
                                component="h1"
                                sx={{ 
                                    fontWeight: 700,
                                    background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontSize: { xs: '2rem', md: '3rem' }
                                }}
                            >
                                Automate Your Cardano Payments
                            </Typography>
                        </Box>
                        
                        <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                            Set up recurring payments on Cardano with smart contracts. Perfect for Hosky token collection, 
                            subscriptions, and any scheduled transactions.
                        </Typography>

                        {/* Feature Cards */}
                        <Stack 
                            direction={{ xs: 'column', md: 'row' }} 
                            spacing={3} 
                            sx={{ mb: 4, justifyContent: 'center' }}
                        >
                            <Card sx={{ maxWidth: 200, background: 'rgba(255, 255, 255, 0.8)' }}>
                                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                    <AccessTimeIcon sx={{ fontSize: '2rem', color: 'success.main', mb: 1 }} />
                                    <Typography variant="h6" gutterBottom>Automated</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Set once, runs automatically without your intervention
                                    </Typography>
                                </CardContent>
                            </Card>
                            
                            <Card sx={{ maxWidth: 200, background: 'rgba(255, 255, 255, 0.8)' }}>
                                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                    <SecurityIcon sx={{ fontSize: '2rem', color: 'warning.main', mb: 1 }} />
                                    <Typography variant="h6" gutterBottom>Secure</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Powered by Aiken smart contracts
                                    </Typography>
                                </CardContent>
                            </Card>
                            
                            <Card sx={{ maxWidth: 200, background: 'rgba(255, 255, 255, 0.8)' }}>
                                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                    <SavingsIcon sx={{ fontSize: '2rem', color: 'info.main', mb: 1 }} />
                                    <Typography variant="h6" gutterBottom>Cost Effective</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Low fees with transparent pricing
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Stack>

                        {/* Call to Action */}
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Chip 
                                icon={<RocketLaunchIcon />}
                                label="Connect your wallet to get started" 
                                variant="outlined"
                                color="primary"
                                sx={{ px: 2, py: 1, fontSize: '1rem' }}
                            />
                        </Box>
                    </Box>
    )

}

export default Hero;
