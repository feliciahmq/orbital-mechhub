import React, { useState, useEffect } from "react";
import MobileNavbar from "../mobileNavbar/MobileNavbar";
import Header from "../header/Header";
import Navbar from "../navbar/Navbar";

import './Format.css';

function Format({content}) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="app-container">
            <Header />
            <div className="content-container">
                {!isMobile && <Navbar />}
                <div className="main-content">
                    {content}
                </div>
                {isMobile && <MobileNavbar />}
            </div>
        </div>
    );
}

export default Format;