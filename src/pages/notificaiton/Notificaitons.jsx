import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { useAuth } from '../../Auth';

import Format from '../../components/format/Format';
import './Notifications.css';

function timeSincePost(postDate) {
	const now = new Date();
	const posted = postDate.toDate ? postDate.toDate() : new Date(postDate);
	const diffInSeconds = Math.floor((now - posted) / 1000);

	if (diffInSeconds < 3600) { 
		const minutes = Math.floor(diffInSeconds / 60);
		return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
	} else if (diffInSeconds < 86400) { 
		const hours = Math.floor(diffInSeconds / 3600);
		return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
	} else if (diffInSeconds < 604800) { 
		const days = Math.floor(diffInSeconds / 86400);
		return `${days} day${days !== 1 ? 's' : ''} ago`;
	} else if (diffInSeconds < 2592000) { 
		const weeks = Math.floor(diffInSeconds / 604800);
		return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
	} else if (diffInSeconds < 7776000) { 
		const months = Math.floor(diffInSeconds / 2592000);
		return `${months} month${months !== 1 ? 's' : ''} ago`;
	} else {
		return 'More than 3 months ago';
	}
}

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
															?`${notification.username} just posted "${notification.listingTitle}"!`
															: notification.type === 'offer'
																?`${notification.username} made an offer for "${notification.listingTitle}"!`
																: notification.type === 'offer_accepted'
																	? `${notification.username} accepted your offer!`
																	: notification.typr === 'offer_rejected' 
																		? `${notification.username} rejected your offer`
																		: `${notification.username} just left you a review!`}
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