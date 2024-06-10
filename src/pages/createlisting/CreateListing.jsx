import React, { useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../Auth';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/header/Header';
import './CreateListing.css';

function ListingPage() {
    const { currentUser } = useAuth();

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        image: '',
        productType: '',
        price: '',
        description: '',
        status: 'available'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userDocRef = doc(db, 'Users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                throw new Error('User not found');
            }

            const userData = userDoc.data();
            const dataToSubmit = {
                ...formData,
                username: userData.username,
                userID: currentUser.uid
            };

            await addDoc(collection(db, 'listings'), dataToSubmit);
            alert('Listing Successfully Listed!');
            setFormData({
                title: '',
                image: '',
                productType: '',
                price: '',
                description: '',
                status: 'available'
            });
            navigate('/');
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const uploadImage = (e) => {
        const file = e.target.files[0];
        if (file && file.type.includes('image')) {
            const fileReader = new FileReader();
            const uploadedImage = fileReader.readAsDataURL(file);
            fileReader.onload = (fileReaderEvent) => {
                const setImage = document.querySelector('.image-upload');
                setImage.style.backgroundImage = `url(${fileReaderEvent.target.result})`;
                setFormData({
                    ...formData,
                    image: fileReaderEvent.target.result
                });
            };
        } else {
            alert('Only Images Allowed');
        }
    };

    return (
        <>
            <div>
                <Header />
            </div>
            <div className='form'>
                <form onSubmit={handleSubmit} >
                    <h1>Add Image:</h1>
                    <div className="image-upload">
                        <input required className='file-input'
                            type="file"
                            accept="image/*"
                            name="image"
                            onChange={uploadImage}
                        />
                        {formData.image && (
                            <div
                                className="uploaded-picture"
                                style={{ backgroundImage: `url(${formData.image})` }}
                            ></div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Title:</label>
                        <input required
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Product Type:</label>
                        <select required
                            type="text"
                            name="productType"
                            value={formData.productType}
                            onChange={handleChange}
                        >
                            <option value='fullBuilds'>Full Builds</option>
                            <option value='keycaps'>Keycaps</option>
                            <option value='switches'>Switches</option>
                            <option value='stabilisers'>Stabilisers</option>
                            <option value='deskmats'>Deskmats</option>
                            <option value='cables'>Cables</option>
                            <option value='groupOrders'>Group Orders</option>
                            <option value='others'>Others</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Price:</label>
                        <input required
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Description:</label>
                        <textarea required
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>
                    <button className='submit' type="submit">Submit</button>
                </form>
            </div>
        </>
    );
}

export default ListingPage;
