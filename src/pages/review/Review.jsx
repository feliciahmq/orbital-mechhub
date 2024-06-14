import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where, doc, getDoc, addDoc } from 'firebase/firestore';
import { useAuth } from '../../Auth';

import Header from "../../components/header/Header";
import './Review.css';

function ReviewPage() {
    const { currentUser }= useAuth();
    const { userID } = useParams();
    const [formData, setFormData] = useState({
        image: "",
        score: "",
        details: "",
        userID: "",
        listerID: "",
        listingID: ""
    });

    const fetchUserData = async () => {
        try {
            const docRef = doc(db, "Users", userID);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const userData = docSnap.data();
                setUserInfo(userData);
                fetchUsersListings(userData.username); 
            } else {
                console.log("No user data found");
            }
        } catch (error) {
          console.log(`Firebase: ${error}`);
        }
      };

    const handleReview = async(e) => {
        e.preventDefault();

        try {
            const DocRef = doc(db, 'Users', currentUser.uid);
            const Doc = await getDoc(DocRef);

            if (!Doc.exists()) {
                throw new Error('User not found');
            }
            const userData = Doc.data();
            const dataToSubmit = {
                ...formData,
                userID: userData.uid,
                listerID: currentUser.uid
            };

            await addDoc(collection(db, 'Reviews', dataToSubmit));
            alert('Listing Successfully Listed!');
            setFormData({
                title: '',
                image: '',
                productType: '',
                price: '',
                description: '',
                status: 'available'
            });
            navigate('/');
        } catch (err) {
            alert('Error :' + err.message);
        }
    };

    return (
        <div>
            <Header />
            <div className="form-container">
                <form onSubmit={handleReview} className='review-form'>

                </form>
                <button className='review-submit' type='submit'>submit</button>
            </div>
        </div>
    );
}

export default ReviewPage;