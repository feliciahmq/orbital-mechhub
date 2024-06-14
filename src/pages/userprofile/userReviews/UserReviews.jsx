import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { FaStar } from 'react-icons/fa';

import './UserReviews.css';

function UserReviews({ reviewDetails }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userDocRef = doc(db, 'Users', reviewDetails.userID);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    setUser(userDocSnap.data());
                }
            } catch (error) {
                console.error("Error fetching user data: ", error);
            }
        };

        fetchUser();
    }, [reviewDetails.userID]);

    const handleUsernameClick = () => {
        navigate(`/profile/${reviewDetails.userID}`);
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    const shownStars = (averageScore) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= averageScore) {
                stars.push(<FaStar key={i} className="star-icon" />);
            } else {
                stars.push(<FaStar key={i} className="star-empty" />);
            }
        }
        return stars;
    };

    return (
        <div className="review-card">
            <div className='reviewer-details'>
                <img
                    className="profile-pic"
                    src={user.profilePic}
                    alt={user.username}
                    onClick={handleUsernameClick}
                />
                <p onClick={handleUsernameClick}>{user.username}</p>
            </div>
            <h4>{shownStars(reviewDetails.score)}</h4>
            <p>{reviewDetails.details}</p>
            {reviewDetails.image && (
                <img
                    className="review-pic"
                    src={reviewDetails.image}
                    alt="Review"
                />
            )}
        </div>
    );
}

export default UserReviews;