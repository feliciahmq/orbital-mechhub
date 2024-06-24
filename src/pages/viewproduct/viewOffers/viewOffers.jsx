import React, { useEffect, useState } from 'react';
import { doc, updateDoc, collection, deleteDoc, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../Auth';

import './viewOffers.css';

function ViewOffers({ onClose, listingID, offers, onOfferAccept, onOfferReject }) {
    const [usernames, setUsernames] = useState({});
    const [profilePic, setProfilePic] = useState({});
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchUsernamesAndProfilePics();
    }, [offers]); 

    const fetchUsernamesAndProfilePics = async () => {
        try {
            const userIds = [...new Set(offers.map(offer => offer.userID))]; 

            const promises = userIds.map(async (userId) => {
                const userDoc = await getDoc(doc(db, 'Users', userId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    return { 
                        [userId]: userData.username,
                        [`${userId}_profilePic`]: userData.profilePic || '/default-profile-pic.jpg'
                    };
                }
                return { [userId]: 'Unknown User' }; 
            });

            const userDataArray = await Promise.all(promises);
            const usernamesObject = Object.assign({}, ...userDataArray);
            setUsernames(usernamesObject);

            const profilePicObject = {};
            userIds.forEach(userId => {
                if (usernamesObject[userId]) {
                    profilePicObject[userId] = usernamesObject[`${userId}_profilePic`];
                }
            });
            setProfilePic(profilePicObject);
        } catch (err) {
            console.error('Error fetching usernames and profile pics:', err.message);
        }
    };

    const handleAcceptOffer = async (offer) => {
        try {
            await updateDoc(doc(db, 'listings', listingID, 'offers', offer.id), {
                accepted: 'true',
            });
            await addDoc(collection(db, 'Notifications'), {
                recipientID: offer.userID,
                senderID: currentUser.uid,
                listingID: listingID,
                type: 'offer_accepted',
                read: false,
                timestamp: new Date(),
            });

            onOfferAccept();
            toast.success(`AcceptedOffer from ${usernames[offer.userID]}`);
        } catch (err) {
            console.error('Error accepting offer:', err.message);
        }
    };

    const handleRejectOffer = async (offer) => {
        try {
            await deleteDoc(doc(db, 'listings', listingID, 'offers', offer.id));
            await addDoc(collection(db, 'Notifications'), {
                recipientID: offer.userID,
                senderID: currentUser.uid,
                listingID: listingID,
                type: 'offer_rejected',
                read: false,
                timestamp: new Date(),
            });

            onOfferReject();
            toast.success(`Rejected Offer from ${usernames[offer.userID]}`);
        } catch (err) {
            console.error('Error rejecting offer:', err.message);
        }
    };

    const handleUsernameClick = (offer) => {
        navigate(`/profile/${offer.userID}`);
    };

    return (
        <div className="popup-overlay">
            <div className="popup">
                <button className="close-button" onClick={onClose}>X</button>
                <div className="offers-list">
                    {offers.map((offer) => (
                        <div key={offer.id} className="offer-item">
                            <p><strong>Offer:</strong> ${offer.offerPrice}</p>
                            <p><strong>Comments:</strong> {offer.comments}</p>
                            <p><strong>Accepted:</strong> {offer.accepted}</p>
                            <div className='user-details'>
                                <img
                                    className='userpic'
                                    src={profilePic[offer.userID]}
                                    alt={`${usernames[offer.userID]}'s profile`}
                                    onClick={() => handleUsernameClick(offer)}
                                />
                                <p onClick={() => handleUsernameClick(offer)}>{usernames[offer.userID]}</p>
                            </div>
                            {offer.accepted !== 'true' && (
                                <div className="offer-actions">
                                    <button onClick={() => handleAcceptOffer(offer)}>Accept</button>
                                    <button onClick={() => handleRejectOffer(offer)}>Reject</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ViewOffers;