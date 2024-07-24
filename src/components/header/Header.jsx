import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../Auth';
import {  FaBars, FaUserAlt, FaPlus, FaQuestionCircle, FaHeart } from 'react-icons/fa';
import { FaKeyboard } from 'react-icons/fa6';
import { useLikes } from '../header/likecounter/LikeCounter';

import SearchBar from '../searchbar/Searchbar';
import MechHub_Logo from "../../assets/Logo/MechHub_logo.png";
import Mechhub_Logo_Mobile from "../../assets/Logo/MH_logo.png";
import "./Header.css";

function Header() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const { currentUser } = useAuth();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [dropdown, setDropdown] = useState(false);
    const { likeCount } = useLikes();

    useEffect(() => {
      const fetchUnreadNotifications = async () => {
        if (currentUser) {
          const notificationsQuery = query(
            collection(db, 'Notifications'),
            where('recipientID', '==', currentUser.uid),
            where('read', '==', false)
          );
          const notificationsSnapshot = await getDocs(notificationsQuery);
          setUnreadCount(0);
        }
      };
      fetchUnreadNotifications();
    }, [currentUser]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleLogoClick = () => {
        navigate(`/`);
    };

    const handleProfile = () => {
        navigate(`/profile/${currentUser.uid}`);
    };

    const handleListing = () => {
        navigate('/listing');
    }

    const handleForumPost = () => {
        navigate('/newforumpost');
    }

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
    };

    const handleMobileBars = () => {
        setDropdown(!dropdown);
    }

    const handleKeyboardGuide = () => {
        navigate(`/keyboardguide`);
    };

    const handleLikes = () => {
        navigate(`/likes/${currentUser.uid}`);
    };

    const trackSearchHistory = async (query) => {
        if (currentUser && query) {
            try {
                await addDoc(collection(db, 'userHistory', currentUser.uid, 'searchHistory'), {
                    query,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error tracking search history:', error);
            }
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        await trackSearchHistory(query);
        navigate(`/search?query=${query}`);
    };

    return (
        <nav className='header'>
            {!isMobile ? (
                <img 
                    src={MechHub_Logo} 
                    className="MechHub_Logo"
                    onClick={handleLogoClick} 
                />
            ) : (
                <>
                    <div onClick={handleMobileBars} style={{ cursor: 'pointer', marginRight: '8px' }}>
                        <FaBars />
                    </div>
                    {dropdown && (
                        <>
                            <div className="dropdown-content">
                                <div className='navbar-icon' onClick={handleKeyboardGuide}>
                                    <FaKeyboard />
                                    <p>Keyboard Guide</p>
                                </div>
                                <div className='navbar-icon'>
                                    <FaQuestionCircle />
                                    <p>Help</p>
                                </div>
                            </div>
                        </>
                    )}
                    <img 
                        src={Mechhub_Logo_Mobile} 
                        className="MechHub_Logo_Mobile"
                        onClick={handleLogoClick} 
                    />
                </>
            )}
            <div className='header-searchbar'>
                <SearchBar 
                    placeholder={"Search Products..."} 
                    handleSearch={handleSearch} 
                    onSearch={(query) => navigate(`/search?query=${query}`)} 
                    query={query}
                    handleInputChange={handleInputChange}    
                />
            </div>
            {currentUser ? (
                <>
                    {!isMobile ? (
                        <>
                            <div className='add-button'>
                                <span><FaPlus fontWeight={100}/> Create</span>
                                <div className='header-dropdown'>
                                    <div className='dropdown-option'>
                                        <p onClick={handleListing}>New Listing</p>
                                    </div>
                                    <div className='dropdown-option'>
                                        <p onClick={handleForumPost}>New Forum Post</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className='likes navbar-icon' onClick={handleLikes}>
                            <FaHeart />
                            {likeCount > 0 && <span className="notification-count">{likeCount}</span>}
                        </div>
                    )}
                    <div className='header-icon'>
                        <FaUserAlt onClick={handleProfile} cursor="pointer" />
                        <span className='tooltip'>profile</span>
                    </div>
            </>
            ) : (
                <li><Link to="/account">Register/ Login</Link></li>
            )}
        </nav>
    );
}

export default Header;