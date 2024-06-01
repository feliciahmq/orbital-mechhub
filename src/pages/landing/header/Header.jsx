import React, { useState } from 'react';
import MechHub_Logo from "../../../assets/Logo/MechHub_logo.png";
import "./Header.css";

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav>
            <img src={MechHub_Logo} className="MechHub_Logo" />
            <div className="hamburger" onClick={toggleMenu}>
                &#9776;
            </div>
            <ul className={menuOpen ? 'open' : ''}>
                <li><a href="">Home</a></li>
                <li><a href="">Search</a></li>
                <li><a href="/account">Register/ Login</a></li>
                <li><a href="" className="likes">Liked: <span>0</span></a></li>
            </ul>
        </nav>
    );
}

export default Header;
