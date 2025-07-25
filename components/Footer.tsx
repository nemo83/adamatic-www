import { Box, Container, Typography, Link, Stack, Divider } from "@mui/material";
import GitHubIcon from '@mui/icons-material/GitHub';
import FavoriteIcon from '@mui/icons-material/Favorite';

export default function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                py: 6,
                mt: 'auto',
            }}
        >
            <Container maxWidth="lg">
                <Stack spacing={4}>
                    {/* Main Footer Content */}
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={4}
                        justifyContent="space-between"
                    >
                        {/* About Section */}
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                AdaMatic
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
                                Automated recurring payments on the Cardano blockchain. 
                                Perfect for regular transactions like Hosky token collection 
                                and other scheduled payments.
                            </Typography>
                        </Box>

                        {/* Navigation Links */}
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                Navigation
                            </Typography>
                            <Stack spacing={1}>
                                <Link href="/" color="inherit" underline="hover">
                                    Automatic Payments
                                </Link>
                                <Link href="/faq" color="inherit" underline="hover">
                                    FAQ
                                </Link>
                                <Link 
                                    href="https://github.com/easy1staking-com/cardano-recurring-payment" 
                                    color="inherit" 
                                    underline="hover"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    GitHub Repository
                                </Link>
                            </Stack>
                        </Box>

                        {/* Resources */}
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                Resources
                            </Typography>
                            <Stack spacing={1}>
                                <Link 
                                    href="https://cardanoscan.io" 
                                    color="inherit" 
                                    underline="hover"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Cardano Explorer
                                </Link>
                                <Link 
                                    href="https://cardano.org" 
                                    color="inherit" 
                                    underline="hover"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Cardano.org
                                </Link>
                                <Link 
                                    href="https://meshjs.dev" 
                                    color="inherit" 
                                    underline="hover"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    MeshJS
                                </Link>
                            </Stack>
                        </Box>
                    </Stack>

                    <Divider sx={{ bgcolor: 'primary.contrastText', opacity: 0.3 }} />

                    {/* Bottom Section */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        alignItems={{ xs: 'center', sm: 'flex-start' }}
                        justifyContent="space-between"
                    >
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            © {new Date().getFullYear()} AdaMatic. Built on Cardano.
                        </Typography>
                        
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ opacity: 0.8 }}
                        >
                            <Typography variant="body2">
                                Sponsored with
                            </Typography>
                            <FavoriteIcon sx={{ fontSize: 16, color: 'error.main' }} />
                            <Typography variant="body2">
                                by
                            </Typography>
                            <Link
                                href="https://easy1staking.com"
                                color="secondary.light"
                                underline="hover"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ fontWeight: 'bold' }}
                            >
                                Easy1Staking
                            </Link>
                        </Stack>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}