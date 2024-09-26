
import 'bootstrap/dist/css/bootstrap.min.css';
import "../styles/globals.css";
import type { AppProps } from "next/app";

import {MeshProvider} from "@meshsdk/react";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers";

export default function App({ Component, pageProps }: AppProps) {
  return (
      <MeshProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Component {...pageProps} />
          </LocalizationProvider>
      </MeshProvider>
  );
}

