
import 'bootstrap/dist/css/bootstrap.min.css';
import "../styles/globals.css";
import type { AppProps } from "next/app";

import { MeshProvider } from "@meshsdk/react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { TourProvider } from '@reactour/tour';
import Navbar from '../components/Navbar';
import { Toaster } from 'react-hot-toast';
import Layout from '../components/Layout';

const theme = createTheme({
    palette: {
        mode: 'light',
    },
});

const steps = [
    {
        selector: '[data-tut="step-0"]',
        content: 'The wallet to use to pay and manage Hosky automatic pulls. Although any wallet can be used, it is recommended to use a small hot wallet.'
    },
    {
        selector: '[data-tut="step-1"]',
        content: 'The Staking or Payment address delegated to a Hosky Rug Pool you want to collect rewards for. ' +
            'It\'s set by default to the connected wallet',
    },
    {
        selector: '[data-tut="step-2"]',
        content: 'The amount of ADA, including protocol fees, that need to be locked in the Smart Contract in order to execute all the planned payments.',
    },
    {
        selector: '[data-tut="step-3"]',
        content: 'Max amount of fees, per pull, the user is willing to pay to cover for AdaMatic and Cardano Transaction fees.',
    },
    {
        selector: '[data-tut="step-4"]',
        content: 'The Hosky doggie bowl Address',
    },
    {
        selector: '[data-tut="step-5"]',
        content: 'The epoch (and the exact date and time) in which the first pull be made',
    },
    {
        selector: '[data-tut="step-6"]',
        content: 'The epoch (and the exact date and time) in which the last pull be made',
    },
    {
        selector: '[data-tut="step-7"]',
        content: 'The number of total pulls to be executed. Currently maxed to 50',
    },
    {
        selector: '[data-tut="step-8"]',
        content: 'The epoch frequency interval to pull Hosky rewards. Hosky allows to stack rewards which allows smaller wallets to save on fees. ' +
            'Such wallets should pull less frequently (2 to 3 epochs). While larger wallets should pull each epoch (e.g. 1 epoch).',
    }
]


export default function App({ Component, pageProps }: AppProps) {
    return (
        <MeshProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TourProvider steps={steps}>
                        <Layout>
                            <Component {...pageProps} />
                        </Layout>
                    </TourProvider>
                </LocalizationProvider>
            </ThemeProvider>
        </MeshProvider>
    );
}

