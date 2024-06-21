import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../Auth';

import Header from '../../components/header/Header';
import './Notifications.css';

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
            const listingDoc = notification.listingID ? await getDoc(doc(db, 'listings', notification.listingID)) : null;
            return {
              ...notification,
              username: senderDoc.exists() ? senderDoc.data().username : 'Unknown User',
              listingTitle: listingDoc && listingDoc.exists() ? listingDoc.data().title : 'Unknown Listing'
            };
          })
        );

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
    <div className='content'>
      <Header />
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
                        : `${notification.username} started following you`}
                  </p>
                  <button onClick={() => markAsRead(notification.id)}>Mark as read</button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <h2>You have no notifications at the moment ( ˘･з･)</h2>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;