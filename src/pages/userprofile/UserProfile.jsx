import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

import EditPopup from "./editUser/EditPopup";
import './UserProfile.css';
import Header from '../../components/header/Header';
import ListingButton from "../../components/listingpopup/Button";
import ProductList from '../../components/productcards/ProductList'; // Assuming you have this component

function UserProfile() {
  const navigate = useNavigate();
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
  }, []);

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid); 
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserInfo(userData);
          console.log(userData);
          fetchUsersListings(userData.username); // Fetch user listings after getting the username
        } else {
          console.log("No user data found");
        }
      } else {
        console.log("User not logged in");
      }
    });
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
            <div className="profile-pic" style={{ backgroundImage: `url(${userInfo.profilePic || "../../../assets/noImage.jpg"})` }} />
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
          <div className="users-listings">
            {userListings.length > 0 ? (
              <ProductList heading="Your Listings" products={userListings} />
            ) : (
              <p>This user has not listed anything yet</p>
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
