import React, { useEffect, useState } from "react";
import { auth, db } from"../../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import './EditPopup.css';

function EditPopup({ onClose, onSubmit }) {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(inputValue);
        setInputValue('');
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

    return (
        <div className="popup-overlay">
            <div className="popup">
                <button className="close-button" onClick={onClose}>X</button>
                <form onSubmit={handleSubmit}>
                    <label>
                        Username:
                        <input 
                            type="text" 
                            value={inputValue} 
                            onChange={(e) => setInputValue(e.target.value)} 
                        />
                    </label>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default EditPopup;
