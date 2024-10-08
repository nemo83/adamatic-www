import React from "react";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorModeContext } from "@/pages/_app";
import { useWalletContext, WalletContext } from "../WalletProvider/WalletProvider";
import { Blockfrost, Blaze, WebWallet, CIP30Interface } from "@blaze-cardano/sdk"
import { Button } from "@mui/material";

declare global {
    interface Window {
        cardano: any;
    }
}

// Header
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];


const Header = () => {

    // Wallet Provider
    const [walletProvider, setWalletProvider] = useWalletContext();

    // Header stuff
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    // Color toggling
    const theme = useTheme();
    const colorMode = useColorModeContext();

    async function connect(walletName: string) {

        console.log(window.cardano);

        const wallet: CIP30Interface = await window.cardano[walletName].enable();

        const provider = new Blockfrost({
            network: 'cardano-mainnet',
            projectId: 'mainnetKWaNkQcrF1erC3u3SZjaFxZiM2M20jFM',
        });

        const blaze = await Blaze.from(provider, new WebWallet(wallet));

        const unusedAddress = await blaze.wallet.getUnusedAddresses();
        console.log('unused address: ' + unusedAddress[0].toBech32());


        

        // setWalletHandle(handle)

        // if (!isReconnect) {
        //     localStorage.setItem(wallet_name_key, walletName)
        //     toast.success('Wallet correctly connected!')
        // }

    }

    async function disconnect() {
        // localStorage.removeItem(wallet_name_key)
        // setWalletHandle(null)
    }

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>

                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        AdaMatic
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                        >

                        </Menu>
                    </Box>
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        AdaMatic
                    </Typography>


                    {/* Color Toggle Button */}
                    <Typography>{theme.palette.mode}</Typography>
                    <IconButton sx={{ mr: 2 }} title={theme.palette.mode + ' mode'} aria-label={theme.palette.mode + 'mode button'} onClick={colorMode.toggleColorMode} color="inherit">
                        {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>

                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            <Button onClick={() => connect('eternl')} sx={{ my: 2, color: 'white', display: 'block' }}>Connect Wallet</Button>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {settings.map((setting) => (
                                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                    <Typography textAlign="center">{setting}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    )
}


export default Header;
