import React from "react";
import Header from "../header/Header";
import Navbar from "../navbar/Navbar";

import './Format.css';

function Format({content}) {
    return (
        <div className="header-navbar">
            <Header />
            <div className="main-page">
                <Navbar />
                <div className="main-content">
                    {content}
                </div>
            </div>
        </div>
    );
}

export default Format;