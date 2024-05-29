import React, { useEffect, useState } from "react";
import { auth, db } from"../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

function UserProfile() {
  const [userInfo, setUserInfo] = useState(null);
  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => { // checks if user is authenticated
      console.log(user);

      const docRef = doc(db, "Users", user.uid); 
      const docSnap = await getDoc(docRef); // retrieves doc data
      if (docSnap.exists()) {
        setUserInfo(docSnap.data()); // updates userInfo with user data
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
      await auth.signOut;
      window.location.href = "/account";
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out: ", error.message);
    }
  }

  return (
    <div>
      {userInfo ? (
        <>
          <p>Username: {userInfo.username}</p>
          <p>Email: {userInfo.email}</p>
          <button className="button" onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <p>No user found.</p>
      )}
    </div>
  );

}

export default UserProfile;