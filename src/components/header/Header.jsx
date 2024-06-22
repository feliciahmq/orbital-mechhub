import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Auth';
import { Link, useNavigate } from 'react-router-dom';
import { useLikes } from './likecounter/LikeCounter';
import { FaComment, FaHeart, FaUserAlt, FaBell } from 'react-icons/fa';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

import SearchBar from '../searchbar/Searchbar';
import MechHub_Logo from "../../assets/Logo/MechHub_logo.png";
import "./Header.css";

function Header() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const { currentUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const { likeCount } = useLikes();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
      const fetchUnreadNotifications = async () => {
        if (currentUser) {
          const notificationsQuery = query(
            collection(db, 'Notifications'),
            where('recipientID', '==', currentUser.uid),
            where('read', '==', false)
          );
          const notificationsSnapshot = await getDocs(notificationsQuery);
          setUnreadCount(notificationsSnapshot.docs.length);
        }
      };
      fetchUnreadNotifications();
    }, [currentUser]);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogoClick = () => {
        navigate(`/`);
    };

    const handleChats = () => {
        navigate(`/`);
    };

    const handleNotifs = () => {
        navigate(`/notifications/${currentUser.uid}`);
    };

    const handleProfile = () => {
        navigate(`/profile/${currentUser.uid}`);
    };

    const handleLikes = () => {
        navigate(`/likes/${currentUser.uid}`);
    };

    return (
        <nav className='navbar'>
            <img 
                src={MechHub_Logo} 
                className="MechHub_Logo"
                onClick={handleLogoClick} 
            />
            <div className='header-searchbar'>
                <SearchBar onSearch={setSearchQuery} />
            </div>
            <div className="hamburger" onClick={toggleMenu}>
                &#9776;
            </div>
            <ul className={menuOpen ? 'open' : 'closed'}>
                {currentUser ? (
                    <>
                        <FaComment onClick={handleChats} cursor="pointer" />
                        <div className='likes'>
                            <FaHeart onClick={handleLikes} cursor="pointer" />
                            {likeCount > 0 && <span className="notification-count">{likeCount}</span>}
                        </div>
                        <div className='notifs'>
                            <FaBell onClick={handleNotifs} cursor="pointer" />
                            {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
                        </div>
                        <FaUserAlt onClick={handleProfile} cursor="pointer" />
                    </>
                ) : (
                    <li><Link to="/account">Register/ Login</Link></li>
                )}
            </ul>
        </nav>
    );
}

export default Header;