import type { AppProps } from "next/app";
import React, { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "react-hot-toast";
import { Box } from "@mui/material";

type DashboardLayoutProps = {
    children: React.ReactNode,
};

const Layout = ({ children }: DashboardLayoutProps) => {
    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '50vh' 
        }}>
            <Toaster />
            <Navbar />
            <Box component="main" sx={{ flex: 1, paddingBottom: 4 }}>
                {children}
            </Box>
            <Footer />
        </Box>
    )
}

export default Layout;


