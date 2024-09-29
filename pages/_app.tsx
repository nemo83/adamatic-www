
import 'bootstrap/dist/css/bootstrap.min.css';
import "../styles/globals.css";
import type { AppProps } from "next/app";

import {MeshProvider} from "@meshsdk/react";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {createTheme, ThemeProvider} from "@mui/material";


const theme = createTheme({
    palette: {
        primary:{
            main: '#0033ad'
        },
        secondary: {
            main: '#ffffff'
        }
    }
})

export default function App({ Component, pageProps }: AppProps) {
  return (

      <MeshProvider>
          <ThemeProvider theme={theme}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Component {...pageProps} />
              </LocalizationProvider>
          </ThemeProvider>
      </MeshProvider>
  );
}

