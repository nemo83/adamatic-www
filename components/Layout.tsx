import type { AppProps } from "next/app";
import React, { ReactNode } from "react";
import Navbar from "./Navbar";
import { Toaster } from "react-hot-toast";

type DashboardLayoutProps = {
    children: React.ReactNode,
};

const Layout = ({ children }: DashboardLayoutProps) => {
    return (
        <>
            <Toaster />
            <Navbar />
            {children}
        </>
    )
}

export default Layout;


