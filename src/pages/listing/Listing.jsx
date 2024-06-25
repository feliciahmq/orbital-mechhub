import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebaseConfig';
import { collection, addDoc, doc, getDoc, updateDoc, getDocs, query } from 'firebase/firestore';
import { useAuth } from '../../Auth';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaAngleLeft } from 'react-icons/fa6';

import Header from '../../components/header/Header';
import './Listing.css';

function ListingPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { listingID } = useParams();

    const [formData, setFormData] = useState({
        title: '',
        image: '',
        productType: 'fullBuilds',
        price: '',
        description: '',
        postDate: '',
        status: 'available'
    });

    useEffect(() => {
        if (listingID) {
            const fetchListing = async () => {
                try {
                    const listingDoc = await getDoc(doc(db, 'listings', listingID));
                    if (listingDoc.exists()) {
                        setFormData({
                            title: listingDoc.data().title || "",
                            image: listingDoc.data().image || "",
                            productType: listingDoc.data().productType || "fullBuilds",
                            price: listingDoc.data().price || "",
                            description: listingDoc.data().description || "",
                            postDate: listingDoc.data().postDate || "", 
                            status: listingDoc.data().status || 'available'
                        });
                    } else {
                        toast.error('Listing not found');
                        navigate('/');
                    }
                } catch (error) {
                    toast.error('Failed to fetch listing');
                    navigate('/');
                }
            };
            fetchListing();
        }
    }, [listingID, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`Updating ${name} to ${value}`);
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
            let dataToSubmit = {
                ...formData,
                username: userData.username,
                userID: currentUser.uid
            };

            if (!listingID) {
                dataToSubmit = {
                    ...dataToSubmit,
                    postDate: new Date().toISOString()
                };
                const docRef = await addDoc(collection(db, 'listings'), dataToSubmit);
                const newListingID = docRef.id;

                const followersQuery = query(collection(db, 'Users', currentUser.uid, 'followers'));
                const followersSnap = await getDocs(followersQuery);

                const notifications = followersSnap.docs.map((followerDoc) => {
                    const followerData = followerDoc.data();
                    if (followerData) {
                        return addDoc(collection(db, 'Notifications'), {
                            recipientID: followerData.followerID,
                            senderID: currentUser.uid,
                            listingID: newListingID,
                            type: 'list',
                            read: false,
                            timestamp: new Date()
                        });
                    } else {
                        console.error('Follower document missing userID:', followerDoc.id);
                        return null;
                    }
                });

                await Promise.all(notifications.filter(notification => notification !== null));
                toast.success('Listing Successfully Created!');
            } else {
                await updateDoc(doc(db, 'listings', listingID), dataToSubmit);
                toast.success('Listing Successfully Updated!');
            }

            setFormData({
                title: '',
                image: '',
                productType: 'fullBuilds',
                price: '',
                description: '',
                postDate: '',
                status: 'available'
            });
            navigate('/');
        } catch (err) {
            console.log('Error: ' + err.message);
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

    const handleCancel = () => {
        navigate(-1);
    }

    return (
        <>
            <div>
                <Header />
            </div>
            <div className='listing-form'>
                <h5 className='back-button' onClick={handleCancel}> <FaAngleLeft /> Go Back </h5>
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
                </form>
            </div>
        </>
    );
}

export default ListingPage;