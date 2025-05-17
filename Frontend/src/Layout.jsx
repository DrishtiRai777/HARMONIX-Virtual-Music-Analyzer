import { Outlet, useLocation } from "react-router-dom";
import AudioPlayerr from "./components/AudioPlayerr";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import React from 'react'

const Layout = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <>
            <Navbar/>
            {!isHome && <AudioPlayerr/>}
            <Outlet/>
            <Footer/>
        </>
    )
}

export default Layout
