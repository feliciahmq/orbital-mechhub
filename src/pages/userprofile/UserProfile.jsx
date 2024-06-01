import React, { useEffect, useState } from "react";
import { auth, db } from"../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; 

import Header from '../../components/header/Header';

function UserProfile() {
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate(); // Initialize navigate hook

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

  async function handleLogout() {
    try {
      await auth.signOut();
      navigate('/account'); 
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out: ", error.message);
    }
  }

  const goHome = () => {
    navigate('/'); 
  };

  return (
    <div>
      <Header />
      {userInfo ? (
        <>
          <p>Username: {userInfo.username}</p>
          <p>Email: {userInfo.email}</p>
          <button className="button" onClick={handleLogout}>
            Logout
          </button>
          <button onClick={goHome}>Home</button>
        </>
      ) : (
        <p>No user found.</p>
      )}
    </div>
  );
}

export default UserProfile;
