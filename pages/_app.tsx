
import 'bootstrap/dist/css/bootstrap.min.css';
import "../styles/globals.css";
import type { AppProps } from "next/app";

import { MeshProvider } from "@meshsdk/react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { createTheme, ThemeProvider } from "@mui/material";
import { TourProvider } from '@reactour/tour';

const theme = createTheme({
    palette: {
        primary: {
            main: '#0033ad'
        },
        secondary: {
            main: '#ffffff'
        }
    }
})

const steps = [
    {
        selector: '[data-tut="step-0"]',
        content: 'Hosky pulls payments can be setup with any wallet, not necessarily the one that is used to delegate to the Rug Pool',
    },
    {
        selector: '[data-tut="step-1"]',
        content: 'The address delegated to a Hosky Rug Pool you want to collect rewards for. ' +
            'It\'s set by default to the connected wallet',
    },
    {
        selector: '[data-tut="step-2"]',
        content: 'The amount of ADA, including protocol fees, to be locked in the Smart Contract in order to execute all the planned payments. ' +
            'For Hosky pulls, this is automatically calculated.',
    },
    {
        selector: '[data-tut="step-3"]',
        content: 'Adamatic protocol fees can change overtime. Users can here specify the MAX amount of fees per pull they want to pay. ' +
            'This does not include any Hosky Vending Maching fees and it\'s currently set to the minimum.',
    },
    {
        selector: '[data-tut="step-4"]',
        content: 'The Hosky rug pool rewards Address',
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
        content: 'The number of total pulls to be executed. Currently maxed to 10',
    },
    {
        selector: '[data-tut="step-8"]',
        content: 'The epoch frequency interval to pull Hosky rewards. Hosky allows to stack rewards which allows smaller wallets to save on fees. ' +
            'Such wallet should pull less frequently (2 to 3 epochs). While larger wallets should pull each epoch (e.g. 1 epoch).',
    }
]


export default function App({ Component, pageProps }: AppProps) {
    return (
        <MeshProvider>
            <ThemeProvider theme={theme}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TourProvider steps={steps}>
                        <Component {...pageProps} />
                    </TourProvider>
                </LocalizationProvider>
            </ThemeProvider>
        </MeshProvider>
    );
}

