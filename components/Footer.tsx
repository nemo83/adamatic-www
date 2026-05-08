import { Box, Container, Typography, Link, Stack, Divider } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useTranslations } from "../src/lib/i18n/I18nProvider";

// Pin link color across :link/:visited/:hover/:active so the user-agent
// purple visited color never leaks through.
const pinInherit = {
    '&, &:link, &:visited, &:hover, &:active': { color: 'inherit' },
};

export default function Footer() {
    const t = useTranslations();
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
                                {t("app.title")}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
                                {t("footer.tagline")}
                            </Typography>
                        </Box>

                        {/* Navigation Links */}
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                {t("footer.navigation")}
                            </Typography>
                            <Stack spacing={1}>
                                <Link href="/" color="inherit" underline="hover" sx={pinInherit}>
                                    {t("nav.setup")}
                                </Link>
                                <Link href="/payments" color="inherit" underline="hover" sx={pinInherit}>
                                    {t("nav.myPulls")}
                                </Link>
                                <Link href="/faq" color="inherit" underline="hover" sx={pinInherit}>
                                    {t("nav.faq")}
                                </Link>
                                <Link
                                    href="https://github.com/easy1staking-com/cardano-recurring-payment"
                                    color="inherit"
                                    underline="hover"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={pinInherit}
                                >
                                    {t("footer.githubRepository")}
                                </Link>
                            </Stack>
                        </Box>

                        {/* Resources */}
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                {t("footer.resources")}
                            </Typography>
                            <Stack spacing={1}>
                                <Link
                                    href="https://cardanoscan.io"
                                    color="inherit"
                                    underline="hover"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={pinInherit}
                                >
                                    {t("footer.cardanoExplorer")}
                                </Link>
                                <Link
                                    href="https://cardano.org"
                                    color="inherit"
                                    underline="hover"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={pinInherit}
                                >
                                    {t("footer.cardanoOrg")}
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
                            {t("footer.copyright", { year: new Date().getFullYear() })}
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ opacity: 0.8 }}
                        >
                            <Typography variant="body2">
                                {t("footer.sponsoredWith")}
                            </Typography>
                            <FavoriteIcon sx={{ fontSize: 16, color: 'error.main' }} />
                            <Typography variant="body2">
                                {t("footer.sponsoredBy")}
                            </Typography>
                            <Link
                                href="https://easy1staking.com"
                                underline="hover"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    fontWeight: 700,
                                    // Warm amber — readable on the blue footer,
                                    // ties to the BetaRibbon / HOSKY accent palette.
                                    // Pinned across :link/:visited/:hover/:active so
                                    // the user-agent purple-after-click never appears.
                                    '&, &:link, &:visited': { color: '#FCD34D' },
                                    '&:hover, &:active': { color: '#FDE68A' },
                                    transition: 'color 160ms ease',
                                }}
                            >
                                easy1staking
                            </Link>
                        </Stack>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}
