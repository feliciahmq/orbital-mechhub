import React, { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import './EditPopup.css';

function EditPopup({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        image: "",
        username: "",
        email: ""
    });

    const uploadImage = (e) => {
        const file = e.target.files[0];
        if (file && file.type.includes('image')) {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = (fileReaderEvent) => {
                setFormData({
                    ...formData,
                    image: fileReaderEvent.target.result
                });
            };
        } else {
            alert('Only Images Allowed');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        const userDocRef = doc(db, 'Users', user.uid);
        try {
            await updateDoc(userDocRef, {
                profilePic: formData.image,
                username: formData.username,
                email: formData.email
            });
            onSubmit(); 
        } catch (err) {
            alert(err);
        }
    };

    const fetchUserData = async () => {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                const docRef = doc(db, "Users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setFormData({
                        image: docSnap.data().profilePic || "",
                        username: docSnap.data().username || "",
                        email: docSnap.data().email || ""
                    });
                } else {
                    console.log("User not logged in");
                }
            }
        });
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <div className="popup-overlay">
            <div className="popup">
                <button className="close-button" onClick={onClose}>X</button>
                <form onSubmit={handleUpdate} className='updateProfile'>
                <div className="input-container"> 
                    <div className="image-upload" style={{ backgroundImage: `url(${formData.image || "../../../assets/noImage.jpg"})` }}> 
                        <input className='file-input' 
                            type="file" 
                            accept="image/*" 
                            name="image" 
                            onChange={uploadImage} /> 
                        </div> 
                        <label>Profile Picture:</label> 
                    </div>
                    <div className="popup-group">
                        <label>Username:</label>
                        <input 
                            type="text" 
                            value={formData.username} 
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                        />
                    </div>
                    <div className="popup-group">
                        <label>Email:</label>
                        <input 
                            type="text" 
                            value={formData.email} 
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                        />
                    </div>
                    <button type="submit" className='profile-submit'>Submit</button>
                </form>
            </div>
        </div>
    );
}

export default EditPopup;
