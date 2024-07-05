import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebaseConfig';
import { collection, addDoc, doc, getDoc, updateDoc, getDocs, query } from 'firebase/firestore';
import { useAuth } from '../../Auth';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaAngleLeft } from 'react-icons/fa6';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Format from '../../components/format/Format';
import Header from '../../components/header/Header';
import './Listing.css';

const saveFormData = (data) => {
    localStorage.setItem('listingFormData', JSON.stringify(data));
};

const loadFormData = () => {
    const savedData = localStorage.getItem('listingFormData');
    return savedData ? JSON.parse(savedData) : null;
};

function ListingPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { listingID } = useParams();

    const [formData, setFormData] = useState({
        title: '',
        images: [], 
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
                        const data = {
                            title: listingDoc.data().title || "",
                            images: listingDoc.data().images || [],
                            productType: listingDoc.data().productType || "fullBuilds",
                            price: listingDoc.data().price || "",
                            description: listingDoc.data().description || "",
                            postDate: listingDoc.data().postDate || "", 
                            status: listingDoc.data().status || 'available'
                        };
                        setFormData(data);
                        saveFormData(data);
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
        } else {
            const savedData = loadFormData();
            if (savedData) {
                setFormData(savedData);
            }
        }
    }, [listingID, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFormData = {
            ...formData,
            [name]: value
        };
        setFormData(newFormData);
        saveFormData(newFormData);
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
                images: [], 
                productType: 'fullBuilds',
                price: '',
                description: '',
                postDate: '',
                status: 'available'
            });
            localStorage.removeItem('listingFormData');
            navigate(`/profile/${currentUser.uid}`);
        } catch (err) {
            console.log('Error: ' + err.message);
        }
    };

    const uploadImage = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + formData.images.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }
        const imageFiles = files.filter(file => file.type.includes('image'));
        if (imageFiles.length !== files.length) {
            toast.error('Only Images Allowed');
            return;
        }

        const fileReaders = imageFiles.map(file => {
            return new Promise((resolve, reject) => {
                const fileReader = new FileReader();
                fileReader.onload = (fileReaderEvent) => {
                    resolve(fileReaderEvent.target.result);
                };
                fileReader.onerror = reject;
                fileReader.readAsDataURL(file);
            });
        });

        Promise.all(fileReaders)
            .then(imageUrls => {
                const newFormData = {
                    ...formData,
                    images: [...formData.images, ...imageUrls]
                };
                setFormData(newFormData);
                saveFormData(newFormData);
            })
            .catch(err => {
                toast.error('Failed to read images');
                console.error(err);
            });
    };

    const handleCancel = () => {
        navigate(-1);
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        centerMode: true,
        centerPadding: '0',
    };

    return (
        <Format content={
            <>
                <div className='listing-form'>
                    <h5 className='back-button' onClick={handleCancel}> <FaAngleLeft /> Go Back </h5>
                    <h2>{listingID ? 'Edit Listing' : 'Create Listing'}</h2>
                    <form onSubmit={handleSubmit}>
                        <h1>Add 1 - 5 Images of the Listing</h1>
                        <div className={`image-upload ${formData.images.length > 0 ? 'has-images' : ''}`}>
                            <input className='file-input'
                                type="file"
                                accept="image/*"
                                name="images"
                                multiple
                                onChange={uploadImage}
                            />
                            {formData.images.length > 0 && (
                                <div className="uploaded-listing-pictures">
                                    <Slider {...settings}>
                                        {formData.images.map((image, index) => (
                                            <div key={index} className="uploaded-listing-picture">
                                                <img src={image} alt={`Uploaded image ${index + 1}`} />
                                            </div>
                                        ))}
                                    </Slider>
                                </div>
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
        } />
    );
}

export default ListingPage;