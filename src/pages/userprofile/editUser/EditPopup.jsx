import React, { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import './EditPopup.css';

function EditPopup({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        image: "",
        username: "",
        email: ""
    });
    const [crop, setCrop] = useState({ aspect: 1 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const [imageRef, setImageRef] = useState(null);

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

    const handleImageLoaded = (image) => {
        setImageRef(image);
    };

    const handleCropComplete = (crop) => {
        setCompletedCrop(crop);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (completedCrop && imageRef) {
            const croppedImageUrl = getCroppedImg(imageRef, completedCrop);
            const user = auth.currentUser;
            const userDocRef = doc(db, 'Users', user.uid);
            try {
                await updateDoc(userDocRef, {
                    profilePic: croppedImageUrl,
                    username: formData.username,
                    email: formData.email
                });
                onSubmit();
            } catch (err) {
                alert(err);
            }
        }
    };

    const getCroppedImg = (image, crop) => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return canvas.toDataURL('image/jpeg');
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
                            {formData.image && (
                                <ReactCrop
                                    src={formData.image}
                                    crop={crop}
                                    ruleOfThirds
                                    onImageLoaded={handleImageLoaded}
                                    onComplete={handleCropComplete}
                                    onChange={(newCrop) => setCrop(newCrop)}
                                />
                            )}
                        <input
                            className='file-input'
                            type="file"
                            accept="image/*"
                            name="image"
                            onChange={uploadImage}
                            />
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
