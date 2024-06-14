import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../Auth';

import EditPopup from "./editUser/EditPopup";
import Header from '../../components/header/Header';
import ListingButton from "../../components/listingpopup/Button";
import ProductList from '../../components/productcards/ProductList'; 
import './UserProfile.css';

function UserProfile() {
  const { userID } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); 
  const [userInfo, setUserInfo] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [viewReviews, setViewReviews] = useState(false);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSubmit = () => {
    setIsPopupOpen(false);
    fetchUserData();
  };

  const handleToggleReview = () => {
    setViewReviews(!viewReviews);
  };

  const fetchUsersListings = async (username) => {
    try {
      const listingsCollection = collection(db, "listings");
      const data = await getDocs(listingsCollection);
      const listingsData = data.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const userSpecificListings = listingsData.filter(listing => listing.username === username);
      setUserListings(userSpecificListings);
    } catch (error) {
      console.log(`Firebase: ${error}`);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const reviewsCollection = collection(db, "reviews");
      const reviewsQuery = query(reviewsCollection, where("userID", "==", userID));
      const data = await getDocs(reviewsQuery);
      const reviewsData = data.docs.map(doc => doc.data());
      setUserReviews(reviewsData);
    } catch (error) {
      console.log(`Firebase: ${error}`);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userID]);

  const fetchUserData = async () => {
    try {
      const docRef = doc(db, "Users", userID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserInfo(userData);
        fetchUsersListings(userData.username); 
        fetchUserReviews();
      } else {
        console.log("No user data found");
      }
    } catch (error) {
      console.log(`Firebase: ${error}`);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log("User logged out successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error logging out: ", error.message);
    }
  };

  const handleLoginNavigation = () => {
    navigate("/account");
  };

  return (
    <div>
      <Header />
      {userInfo ? (
        <>
          <div className="profile-container">
            <div className="profile-pic" style={{ backgroundImage: `url(${userInfo.profilePic})` }} />
            <p>@{userInfo.username}</p>
            <button className="toggle-listing-reviews" onClick={handleToggleReview}>
              {viewReviews ? "View Listings" : "View Reviews"}
            </button>
            {currentUser?.uid === userID && (
              <>
                <button className="edit-profile" onClick={handleOpenPopup}>
                  Edit Profile
                </button>
                {isPopupOpen && <EditPopup onClose={handleClosePopup} onSubmit={handleSubmit} />}
                <button className="logout" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
            <ListingButton />
          </div>
          <div className="user-content">
            {viewReviews ? (
              <div className="user-reviews">
                {userReviews.length > 0 ? (
                  <h2>reviews go here</h2>
                ) : (
                  <h2>This user has no reviews ( ˘･з･) </h2>
                )}
              </div>
            ) : (
              <div className="users-listings">
                {userListings.length > 0 ? (
                  <ProductList heading={`${userInfo.username}'s Listings`} products={userListings} />
                ) : (
                  <h2>This user has no listings ( ˘･з･) </h2>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div>
          <p>No user found.</p>
          <button onClick={handleLoginNavigation}>Login</button>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
