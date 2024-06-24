import React, { useEffect, useState } from "react";
import { auth, db } from "/src/lib/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../Auth';

import EditPopup from "./editUser/EditPopup";
import Header from '../../components/header/Header';
import ListingButton from "../../components/listingpopup/Button";
import ProductList from '../../components/productcards/ProductList'; 
import './UserProfile.css';

const defaultProfilePic = "/src/assets/defaultProfile.jpg"; 

function UserProfile() {
  const { userID } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); 
  const [userInfo, setUserInfo] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [userListings, setUserListings] = useState([]);

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

  const handleChatNavigation = () => {
    window.location.href = `/chat/${currentUser.uid}`;
  };

  return (
    <div>
      <Header />
      {userInfo ? (
        <>
          <div className="profile-container">
            <div className="profile-pic" style={{ backgroundImage: `url(${userInfo.profilePic || defaultProfilePic})` }} />
            <p>@{userInfo.username}</p>
            {currentUser?.uid === userID && (
              <>
                <button className="edit-profile" onClick={handleOpenPopup}>
                  Edit Profile
                </button>
                {isPopupOpen && <EditPopup onClose={handleClosePopup} onSubmit={handleSubmit} />}
                <button className="chat-button" onClick={handleChatNavigation}>
                  Chat
                </button>
                <button className="logout" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
            <ListingButton />
          </div>
          <div className="users-listings">
            {userListings.length > 0 ? (
              <ProductList heading={`${userInfo.username}'s Listings`} products={userListings} />
            ) : (
              <h2>This user has no listings ( ˘･з･) </h2>
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
