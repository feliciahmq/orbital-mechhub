import React, { useState } from "react";
import { auth, db } from "../../../firebase/firebaseConfig";
import { doc, addDoc, collection } from "firebase/firestore";
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
                offerPrice: offerData.offerPrice,
                comments: offerData.comments,
                accepted: false,
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
        } catch (err) {
            console.log(err.message);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup">
                <button className="close-button" onClick={onClose}>X</button>
                <form onSubmit={handleOfferSubmit} className='offer-form'>
                    <div className="popup-group">
                        <label>Offer Price:</label>
                        <input 
                            type="number" 
                            name="offerPrice"
                            value={offerData.offerPrice} 
                            onChange={handleChange} 
                            required
                        />
                    </div>
                    <div className="popup-group">
                        <label>Comments:</label>
                        <textarea 
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