import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

import EditPopup from "./editUser/EditPopup";
import './UserProfile.css';
import Header from '../../components/header/Header';
import ListingButton from "../../components/listingpopup/Button";

function UserProfile() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      console.log(user);

      const docRef = doc(db, "Users", user.uid); 
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserInfo(docSnap.data());
        console.log(docSnap.data());
      } else {
        console.log("User not logged in");
      }
    });
  }

  useEffect(() => {
    fetchUserData();
  }, []);

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
            <img src={userInfo.profilePic} alt="Profile" className="profile-pic" />
            <p>@{userInfo.username}</p>
            <button className="edit-profile" onClick={handleOpenPopup}>
              Edit Profile
            </button>
            {isPopupOpen && <EditPopup onClose={handleClosePopup} onSubmit={handleSubmit} />}
            <button className="logout" onClick={handleLogout}>
              Logout
            </button>
            <ListingButton />
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
