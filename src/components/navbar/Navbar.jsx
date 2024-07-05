import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Auth';
import { Link, useNavigate } from 'react-router-dom';
import { useLikes } from '../header/likecounter/LikeCounter';
import { FaComment, FaHeart, FaBell, FaQuestionCircle } from 'react-icons/fa';
import { FaHouse } from 'react-icons/fa6';
import { FaComments } from 'react-icons/fa6';
import { query, collection, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';

import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const { currentUser } = useAuth();
    const { likeCount } = useLikes();
    const [unreadCount, setUnreadCount] = useState(0);
    const [chatUnreadCount, setChatUnreadCount] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
        const fetchUnreadChat = async () => {
            if (currentUser) {
                const userChatsQuery = query(
                    collection(db, 'UserChats'),
                    where('users', 'array-contains', currentUser.uid)
                );
                onSnapshot(userChatsQuery, (snapshot) => {
                    let unreadMessages = 0;
                    snapshot.docs.forEach((doc) => {
                        const chatData = doc.data();
                        chatData.messages.forEach((message) => {
                            if (message.senderId !== currentUser.uid && !message.isSeen) {
                                unreadMessages++;
                            }
                        });
                    });
                    setChatUnreadCount(unreadMessages);
                });
            }
        };

        fetchUnreadNotifications();
        fetchUnreadChat();
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
    
    return (
        <nav className="navbar">
            <ul className="closed">
                {currentUser ? (
                    <>
                        <div className='navbar-icon' onClick={handleHome}>
                            <FaHouse />
                            <p>Home</p>
                        </div>
                        <div className='navbar-icon' onClick={handleChats}>
                            <FaComment />
                            <p>Chats</p>
                            {chatUnreadCount > 0 && <span className="notification-count">{chatUnreadCount}</span>}
                            <span className='tooltip'>Chats</span>
                        </div>
                        <div className='likes navbar-icon' onClick={handleLikes}>
                            <FaHeart />
                            <p>Likes</p>
                            {likeCount > 0 && <span className="notification-count">{likeCount}</span>}
                            <span className='tooltip'>Likes</span>
                        </div>
                        <div className='notifs navbar-icon' onClick={handleNotifs}>
                            <FaBell />
                            <p>Notifications</p>
                            {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
                            <span className='tooltip'>Notifications</span>
                        </div>
                        <div className='navbar-icon' onClick={handleForum}>
                            <FaComments />
                            <p>Forum</p>
                            <span className='tooltip'>Forum</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className='navbar-icon' onClick={handleHome}>
                            <FaHouse />
                            <p>Home</p>
                        </div>
                        <div className='navbar-icon' onClick={handleForum}>
                            <FaComments />
                            <p>Forum</p>
                            <span className='tooltip'>Forum</span>
                        </div>
                    </>
                )}
            </ul>
            <div className="resource">
                <h1>Resources</h1>
                <ul className='closed'>
                    <div className='navbar-icon'>
                        <p>Keyboard Guide</p>
                    </div>
                    <div className='navbar-icon'>
                        <FaQuestionCircle />
                        <p>Help</p>
                    </div>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;