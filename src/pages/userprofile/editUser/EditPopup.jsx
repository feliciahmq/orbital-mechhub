import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../../../lib/firebaseConfig";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import './EditPopup.css';

function EditPopup({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        image: "",
        username: "",
        email: ""
    });

    const [imageFile, setImageFile] = useState(null);

    const uploadImage = (e) => {
        const file = e.target.files[0];
        if (file && file.type.includes('image')) {
            setImageFile(file);
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
            let profilePicUrl = formData.image;

            if (imageFile) {
                const storageRef = ref(storage, `profilePics/${user.uid}/${imageFile.name}`);
                await uploadBytes(storageRef, imageFile);
                profilePicUrl = await getDownloadURL(storageRef);
            }

            await updateDoc(userDocRef, {
                profilePic: profilePicUrl,
                username: formData.username,
                email: formData.email
            });
    
            const listingsQuery = query(collection(db, 'listings'), where('userId', '==', user.uid));
            const querySnapshot = await getDocs(listingsQuery);
    
            const batch = writeBatch(db);
    
            querySnapshot.forEach((listingDoc) => {
                batch.update(listingDoc.ref, { username: formData.username });
            });
    
            await batch.commit();
            
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
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
                        <label>Profile Picture</label> 
                    </div>
                    <div className="popup-group">
                        <label>Username:</label>
                        <input 
                            type="text" 
                            name="username"
                            value={formData.username} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div className="popup-group">
                        <label>Email:</label>
                        <input 
                            type="text" 
                            name="email"
                            value={formData.email} 
                            onChange={handleChange} 
                        />
                    </div>
                    <button type="submit" className='profile-submit'>Submit</button>
                </form>
            </div>
        </div>
    );
}

export default EditPopup;
