import React, { useState } from "react";
import { auth, db } from "../../../lib/firebaseConfig";
import { doc, addDoc, collection } from "firebase/firestore";
import { toast } from 'react-hot-toast';

import './offerPopup.css';

function OfferPopup({ onClose, onSubmit, listingID, currentUser, userID }) {
    const [offerData, setOfferData] = useState({
        offerPrice: "",
        comments: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOfferData({
            ...offerData,
            [name]: value
        });
    };

    const handleOfferSubmit = async (e) => {
        e.preventDefault();

        try {
            await addDoc(collection(db, 'listings', listingID, 'offers'), {
                userID: currentUser.uid,
                offerPrice: parseFloat(offerData.offerPrice).toFixed(2), // Ensure offerPrice is a valid decimal
                comments: offerData.comments,
                accepted: '',
                timestamp: new Date()
            });

            await addDoc(collection(db, 'Notifications'), {
                recipientID: userID,
                senderID: currentUser.uid,
                listingID: listingID,
                type: 'offer',
                read: false,
                timestamp: new Date()
            });

            onSubmit();
            toast.success('Offer Sent!');
        } catch (err) {
            console.log(err.message);
        }
    };

    return (
        <div className="offer-popup-overlay">
            <div className="offer-popup">
                <button className="close-button" onClick={onClose}>X</button>
                <form onSubmit={handleOfferSubmit} className='offer-form'>
                    <div className="offer-popup-group">
                        <label htmlFor="offerPrice">Offer Price:</label>
                        <input 
                            id="offerPrice"
                            type="text" 
                            name="offerPrice"
                            value={offerData.offerPrice} 
                            onChange={handleChange} 
                            pattern="^\d+(\.\d{1,2})?$" 
                            title="Please enter a valid price with up to 2 decimal places"
                            required
                        />
                    </div>
                    <div className="offer-popup-group">
                        <label htmlFor="comments">Comments:</label>
                        <textarea 
                            id="comments"
                            name="comments"
                            value={offerData.comments} 
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className='offer-submit'>Submit Offer</button>
                </form>
            </div>
        </div>
    );
}

export default OfferPopup;