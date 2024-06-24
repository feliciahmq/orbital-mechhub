import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebaseConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, addDoc } from 'firebase/firestore';
import { useAuth } from '../../Auth';
import { FaStar } from "react-icons/fa";
import { toast } from 'react-hot-toast';

import Header from "../../components/header/Header";
import './Review.css';

function ReviewPage() {
    const { currentUser } = useAuth();
    const { userID } = useParams();
    const navigate = useNavigate();
    const [currentValue, setCurrentValue] = useState(0);
    const [hoverValue, setHoverValue] = useState(undefined);
    const [formData, setFormData] = useState({
        image: "",
        score: 0,
        details: "",
        userID: currentUser ? currentUser.uid : "",
        listingID: userID,
        listerID: "",
    });
    const [listerID, setListerID] = useState(null);

    useEffect(() => {
        const fetchListingData = async () => {
            try {
                const listingDocRef = doc(db, 'listings', userID);
                const listingDocSnap = await getDoc(listingDocRef);

                if (listingDocSnap.exists()) {
                    const listingData = listingDocSnap.data();
                    setFormData(prevState => ({
                        ...prevState,
                        listerID: listingData.userID 
                    }));
                    setListerID(listingData.userID); 
                } else {
                    console.log("No listing data found");
                }
            } catch (error) {
                console.log(`Firebase: ${error}`);
            }
        };

        fetchListingData();
    }, [userID]);

    const handleReview = async (e) => {
        e.preventDefault();

        if (currentValue === 0) {
            toast.error('Please provide a rating.');
            return;
        }
        if (formData.details.trim() === "") {
            toast.error('Please Fill in All Fields');
            return;
        }

        try {
            const userDocRef = doc(db, 'Users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                throw new Error('User not found');
            }

            const dataToSubmit = {
                ...formData,
                score: currentValue,
            };

            await addDoc(collection(db, 'Reviews'), dataToSubmit);
            toast.success('Review Successfully Submitted!');
            setFormData({
                image: "",
                score: 0,
                details: "",
                userID: currentUser.uid,
                listingID: userID,
                listerID: ""
            });

            await addDoc(collection(db, 'Notifications'), {
                recipientID: listerID,
                senderID: currentUser.uid,
                listingID: userID,
                type: 'review',
                read: false,
                timestamp: new Date()
            });
            
            navigate('/');
        } catch (err) {
            toast.error('Error :' + err.message);
        }
    };

    const handleClick = value => {
        setCurrentValue(value);
    };

    const handleMouseOver = newHoverValue => {
        setHoverValue(newHoverValue);
    };

    const handleMouseLeave = () => {
        setHoverValue(undefined);
    };

    const handleChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        });
    };

    const uploadImage = (e) => {
        const file = e.target.files[0];
        if (file && file.type.includes('image')) {
            const fileReader = new FileReader();
            fileReader.onload = (fileReaderEvent) => {
                setFormData({
                    ...formData,
                    image: fileReaderEvent.target.result
                });
            };
            fileReader.readAsDataURL(file);
        } else {
            toast.error('Only Images Allowed');
        }
    };
    
    return (
        <div>
        <Header />
        <div className='review-container'>
            <h2>Leave a Review</h2>
            <form className='review-form' onSubmit={handleReview}>
            <h5>you may add an image of the product here:</h5>
            <div className='review-image'>
                <input className='file-input'
                    type="file"
                    accept="image/*"
                    name="image"
                    onChange={uploadImage}
                />
                {formData.image && (
                    <div
                        className="uploaded-listing-picture"
                        style={{ backgroundImage: `url(${formData.image})` }}
                    ></div>
                )}
            </div>
            <div className='review-stars'>
                <h5>rate your experience:</h5>
                <div className='stars'>
                    {Array(5).fill(0).map((_, index) => (
                    <FaStar
                        key={index}
                        size={24}
                        onClick={() => handleClick(index + 1)}
                        onMouseOver={() => handleMouseOver(index + 1)}
                        onMouseLeave={handleMouseLeave}
                        color={(hoverValue || currentValue) > index ? '#FF4B2B' : '#a9a9a9'}
                        style={{
                        marginRight: 10,
                        cursor: "pointer"
                        }}
                    />
                    ))}
                </div>
            </div>
            <textarea
                className="details"
                name="details"
                placeholder="What's your experience?"
                value={formData.details}
                onChange={handleChange}
            />
            <button className='review-submit' type="submit">Submit Review</button>
            </form>
        </div>
        </div>
    );
}

export default ReviewPage;

// star rating credit: https://github.com/iradualbert/star-ratings/blob/master/src/ReviewPage.js