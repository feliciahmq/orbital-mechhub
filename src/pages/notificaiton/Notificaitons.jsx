import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { useAuth } from '../../Auth';

import Format from '../../components/format/Format';
import './Notifications.css';
import timeSincePost from "../../components/timeSincePost/timeSincePost";

function NotificationsPage() {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    useEffect(() => {
        const fetchNotifications = async () => {
            if (currentUser) {
                const notificationsQuery = query(
                    collection(db, 'Notifications'),
                    where('recipientID', '==', currentUser.uid),
                );
                const notificationsSnapshot = await getDocs(notificationsQuery);
                const notificationsData = notificationsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const notificationsWithDetails = await Promise.all(
                    notificationsData.map(async (notification) => {
                        const senderDoc = await getDoc(doc(db, 'Users', notification.senderID));
                        if (notification.type === 'forum') {
                            const postDoc = notification.postID ? await getDoc(doc(db, 'Forum', notification.postID)) : null;
                            console.log('Forum post document:', postDoc ? postDoc.data() : 'No document');
                            return {
                                ...notification,
                                username: senderDoc.exists() ? senderDoc.data().username : 'Unknown User',
                                postTitle: postDoc && postDoc.exists() ? postDoc.data().title : 'Unknown Post'
                            };
                        } else if (notification.listingID) {
                            const listingDoc = await getDoc(doc(db, 'listings', notification.listingID));
                            return {
                                ...notification,
                                username: senderDoc.exists() ? senderDoc.data().username : 'Unknown User',
                                listingTitle: listingDoc && listingDoc.exists() ? listingDoc.data().title : 'Unknown Listing'
                            };
                        } else {
                            return {
                                ...notification,
                                username: senderDoc.exists() ? senderDoc.data().username : 'Unknown User'
                            };
                        }
                    })
                );

                notificationsWithDetails.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());

                setNotifications(notificationsWithDetails);
                clearReadNotifs(notificationsWithDetails);
            }
        };

        fetchNotifications();
    }, [currentUser]);

    const markAsRead = async (notificationID) => {
        const notificationDoc = doc(db, 'Notifications', notificationID);
        await updateDoc(notificationDoc, {
            read: true,
            readTimestamp: new Date()
        });

        setNotifications(prevNotifications =>
            prevNotifications.map(notification =>
                notification.id === notificationID ? { ...notification, read: true, readTimestamp: new Date() } : notification
            )
        );
    };

    const clearReadNotifs = async (notificationsToClean) => {
        const now = new Date().getTime();

        for (const notification of notificationsToClean) {
            if (notification.read && notification.readTimestamp) {
                const readTime = new Date(notification.readTimestamp).getTime();
                if (now - readTime > sevenDays) {
                    await deleteDoc(doc(db, 'Notifications', notification.id));
                    setNotifications(prevNotifications =>
                        prevNotifications.filter(n => n.id !== notification.id)
                    );
                }
            }
        }
    };

    const unreadNotifs = notifications.filter(notification => !notification.read);

    return (
        <Format content={
            <div className='content'>
                <div className='notifications-container'>
                    {unreadNotifs.length > 0 ? (
                        <>
                            <h2>Your Notifications</h2>
                            <ul>
                                {unreadNotifs.map(notification => (
                                    <li key={notification.id} className={notification.read ? 'read' : 'unread'}>
                                        <p>
                                            {notification.type === 'like'
                                                ? `${notification.username} liked your post "${notification.listingTitle}"!`
                                                : notification.type === 'sold'
                                                    ? `The listing "${notification.listingTitle}" was sold`
                                                    : notification.type === 'follow' 
                                                        ? `${notification.username} started following you!`
                                                        : notification.type === 'list' 
                                                            ? `${notification.username} just listed "${notification.listingTitle}"!`
                                                            : notification.type === 'offer'
                                                                ? `${notification.username} made an offer for "${notification.listingTitle}"!`
                                                                : notification.type === 'offer_accepted'
                                                                    ? `${notification.username} accepted your offer!`
                                                                    : notification.type === 'offer_rejected' 
                                                                        ? `${notification.username} rejected your offer`
                                                                        : notification.type === 'forum' 
                                                                            ? `${notification.username} just posted "${notification.postTitle || 'a new post'}" in the forum!`
                                                                            : notification.type === 'forum-comment' 
																				?`${notification.username} just commented on "${notification.postTitle || 'a new post'}"`
																				:notification.type === 'forum-like' 
																					?`${notification.username} just liked "${notification.postTitle || 'a new post'}"`
																					: `${notification.username} performed an unknown action.`}

                                        </p>
                                        <button onClick={() => markAsRead(notification.id)}>Mark as read</button>
                                        <h5>{timeSincePost(notification.timestamp)}</h5>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <h2>You have no notifications at the moment ( ˘･з･)</h2>
                    )}
                </div>
            </div>
        } />
    );
}

export default NotificationsPage;