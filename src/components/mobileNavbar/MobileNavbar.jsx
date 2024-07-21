import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Auth';
import { useNavigate } from 'react-router-dom';
import { useLikes } from '../header/likecounter/LikeCounter';
import { FaComment, FaHeart, FaBell, FaQuestionCircle,  FaCopyright, FaPlus } from 'react-icons/fa';
import { FaHouse, FaComments } from 'react-icons/fa6';
import { query, collection, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';

import Mechhub_Logo_small from "../../assets/Logo/MH_logo.png";
import './MobileNavbar.css';

function MobileNavbar() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { likeCount } = useLikes();
    const [unreadCount, setUnreadCount] = useState(0);
    const [chatUnreadCount, setChatUnreadCount] = useState(0);

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

    const handleHome = () => {
        navigate(`/`)
    }
    const handleChats = () => {
        navigate(`/chat/${currentUser.uid}`);
    };

    const handleNotifs = () => {
        navigate(`/notifications/${currentUser.uid}`);
    };

    const handleLikes = () => {
        navigate(`/likes/${currentUser.uid}`);
    };

    const handleForum = () => {
        navigate(`/forum`);
    };
    const handleListing = () => {
        navigate('/listing');
    }

    const handleForumPost = () => {
        navigate('/newforumpost');
    }

    return (
        <nav className="mobile-navbar">
            <ul className="closed">
                {currentUser ? (
                    <>
                        <div className='mobile-navbar-icon' onClick={handleHome}>
                            <FaHouse />
                            <p>Home</p>
                        </div>

                        {/* <div className='likes mobile-navbar-icon' onClick={handleLikes}>
                            <FaHeart />
                            <p>Likes</p>
                            {likeCount > 0 && <span className="notification-count">{likeCount}</span>}
                        </div> */}

                        <div className='mobile-navbar-icon' onClick={handleForum}>
                            <FaComments />
                            <p>Forum</p>
                        </div>

                        <div className='mobile-navbar-icon add-button' >
                            <FaPlus /> 
                            <p>Create</p>
                            <div className='header-dropdown'>
                                <div className='dropdown-option'>
                                    <p onClick={handleListing}>New Listing</p>
                                </div>
                                <div className='dropdown-option'>
                                    <p onClick={handleForumPost}>New Forum Post</p>
                                </div>
                            </div>
                        </div>
                        <div className='notifs mobile-navbar-icon' onClick={handleNotifs}>
                            <FaBell />
                            <p>Notifications</p>
                            {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
                        </div>
                        <div className='mobile-navbar-icon' onClick={handleChats}>
                            <FaComment />
                            <p>Chats</p>
                            {chatUnreadCount > 0 && <span className="notification-count">{chatUnreadCount}</span>}
                        </div>
                    </>
                ) : (
                    <>
                        <div className='mobile-navbar-icon' onClick={handleHome}>
                            <FaHouse />
                            <p>Home</p>
                        </div>
                        <div className='mobile-navbar-icon' onClick={handleForum}>
                            <FaComments />
                            <p>Forum</p>
                            <span className='tooltip'>Forum</span>
                        </div>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default MobileNavbar;