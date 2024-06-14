import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, addDoc } from 'firebase/firestore';
import { useAuth } from '../../Auth';
import { FaStar } from "react-icons/fa";
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
        userID: userID,
        listerID: currentUser ? currentUser.uid : "",
    });

    useEffect(() => {
        const fetchUserData = async () => {
        try {
            const docRef = doc(db, "Users", userID);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
            const userData = docSnap.data();
            } else {
            console.log("No user data found");
            }
        } catch (error) {
            console.log(`Firebase: ${error}`);
        }
        };

        fetchUserData();
    }, [userID]);

    const handleReview = async (e) => {
        e.preventDefault();

        if (currentValue === 0) {
        alert('Please provide a rating.');
        return;
        }
        if (formData.details.trim() === "") {
        alert('Please provide your review details.');
        return;
        }

        try {
        const DocRef = doc(db, 'Users', currentUser.uid);
        const Doc = await getDoc(DocRef);

        if (!Doc.exists()) {
            throw new Error('User not found');
        }

        const dataToSubmit = {
            ...formData,
            score: currentValue,
        };

        await addDoc(collection(db, 'Reviews'), dataToSubmit);
        alert('Review Successfully Submitted!');
        setFormData({
            image: "",
            score: 0,
            details: "",
            userID: userID,
            listerID: currentUser.uid,
        });
        navigate('/');
        } catch (err) {
        alert('Error :' + err.message);
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

    return (
        <div>
        <Header />
        <div className='review-container'>
            <h2>Leave a Review</h2>
            <form className='review-form' onSubmit={handleReview}>
            <div className='review-image'>
                {/* Optionally add an image input here */}
            </div>
            <div className='review-stars'>
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
            <textarea
                className="details"
                name="details"
                placeholder="What's your experience?"
                value={formData.details}
                onChange={handleChange}
            />
            <button className='review-submit' type="submit">Submit</button>
            </form>
        </div>
        </div>
    );
}

export default ReviewPage;

// star rating credit: https://github.com/iradualbert/star-ratings/blob/master/src/ReviewPage.js