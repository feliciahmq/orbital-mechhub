import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../Auth';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import Header from '../../components/header/Header';
import './Listing.css';

function ListingPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { listingID } = useParams();

    const [formData, setFormData] = useState({
        title: '',
        image: '',
        productType: '',
        price: '',
        description: '',
        status: 'available'
    });

    useEffect(() => {
        if (listingID) {
            const fetchListing = async () => {
                const listingDoc = await getDoc(doc(db, 'listings', listingID));
                if (listingDoc.exists()) {
                    setFormData({
                        title: listingDoc.data().title || "",
                        image: listingDoc.data().image || "",
                        productType: listingDoc.data().productType || "",
                        price: listingDoc.data().price || "",
                        description: listingDoc.data().description || ""
                    });
                } else {
                    toast.error('Listing not found');
                    navigate('/');
                }
            };
            fetchListing();
        }
    }, [listingID, navigate]);

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

            if (listingID) {
                await updateDoc(doc(db, 'listings', listingID), dataToSubmit);
                toast.success('Listing Successfully Updated!');
            } else {
                await addDoc(collection(db, 'listings'), dataToSubmit);
                toast.success('Listing Successfully Created!');
            }

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
            toast.error('Error: ' + err.message);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();

        try {
            await deleteDoc(doc(db, 'listings', listingID));
            toast.success('Listing Successfully Deleted!');
            navigate('/');
        } catch (err) {
            toast.error('Error: ' + err.message);
        }
    };

    const uploadImage = (e) => {
        const file = e.target.files[0];
        if (file && file.type.includes('image')) {
            const fileReader = new FileReader();
            fileReader.onload = (fileReaderEvent) => {
                setFormData({
                    ...formData,
                    image: fileReaderEvent.target.result
                });
            };
            fileReader.readAsDataURL(file);
        } else {
            toast.error('Only Images Allowed');
        }
    };

    return (
        <>
            <div>
                <Header />
            </div>
            <div className='listing-form'>
                <h2>{listingID ? 'Edit Listing' : 'Create Listing'}</h2>
                <form onSubmit={handleSubmit}>
                    <h1>Add Image:</h1>
                    <div className="image-upload">
                        <input className='file-input'
                            type="file"
                            accept="image/*"
                            name="image"
                            onChange={uploadImage}
                        />
                        {formData.image && (
                            <div
                                className="uploaded-listing-picture"
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
                    <button className='submit' type="submit">{listingID ? 'Update' : 'Submit'}</button>
                    {listingID && (
                        <button className='delete' onClick={handleDelete}>Delete Listing</button>
                    )}
                </form>
            </div>
        </>
    );
}

export default ListingPage;
