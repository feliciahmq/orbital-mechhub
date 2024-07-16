import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, deleteDoc, query, where, getDocs, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { useAuth } from '../../Auth';
import { FaRegHeart, FaHeart, FaStar, FaStarHalf, FaComment } from "react-icons/fa";
import { FaEllipsisVertical } from 'react-icons/fa6';
import { useLikes } from '../../components/header/likecounter/LikeCounter';
import { toast } from 'react-hot-toast';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Format from '../../components/format/Format';
import SellerDashboard from '../../components/sellerDashboard/SellerDashboard';
import OfferPopup from './offerPopup/offerPopup';
import ViewOffers from './viewOffers/viewOffers';
import SimilarProducts from '../../components/recommendation/similarProducts/similarProductsRec';
import './ViewProduct.css';

function timeSincePost(postDate) {
    const now = new Date();
    const posted = new Date(postDate);
    const diffInSeconds = Math.floor((now - posted) / 1000);

    if (diffInSeconds < 3600) { 
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) { 
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) { 
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) { 
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 7776000) { 
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months} month${months !== 1 ? 's' : ''} ago`;
    } else {
        return 'More than 3 months ago';
    }
}

function ProductPage() {
    const { listingID } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [listing, setListing] = useState(null);
    const [user, setUser] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeID, setLikeID] = useState(null);
    const { likesCount, increaseLikeCount, decreaseLikeCount } = useLikes();
    const [averageScore, setAverageScore] = useState(0);
    const [numberOfReviews, setNumberOfReviews] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false); 
    const [listingSold, setListingSold] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [offers, setOffers] = useState([]);
    const [viewOffersPopupOpen, setViewOffersPopupOpen] = useState(false);
    const [offerAccepted, setOfferAccepted] = useState(false);

    //fetch user/ listing details
    useEffect(() => {
        const fetchListing = async () => {
            const listingDocRef = doc(db, 'listings', listingID);
            const listingDocSnap = await getDoc(listingDocRef);

            if (listingDocSnap.exists()) {
                const listingData = listingDocSnap.data();
                setListing(listingData);

                const userDocRef = doc(db, 'Users', listingData.userID);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUser(userDocSnap.data());
                    fetchUserReviews(userDocSnap.id);
                }
                setListingSold(listingData.status === 'sold');
            } else {
                console.log('There is no such listing');
            }
        };

        const checkIfLiked = async () => {
            if (currentUser) {
                const likesQuery = query(
                    collection(db, 'Likes'),
                    where('userID', '==', currentUser.uid),
                    where('listingID', '==', listingID)
                );
                const likesSnapshot = await getDocs(likesQuery);
                if (!likesSnapshot.empty) {
                    setIsLiked(true);
                    setLikeID(likesSnapshot.docs[0].id);
                }
            }
        };

        const fetchUserReviews = async (userID) => {
            try {
                const reviewsCollection = collection(db, 'Reviews');
                const reviewsQuery = query(reviewsCollection, where('listerID', '==', userID));
                const data = await getDocs(reviewsQuery);
                const reviewsData = data.docs.map((doc) => doc.data());
                const numberOfReviews = reviewsData.length;
                setNumberOfReviews(numberOfReviews);

                if (numberOfReviews > 0) {
                    const totalScore = reviewsData.reduce((accumulator, review) => accumulator + review.score, 0);
                    const avgScore = totalScore / numberOfReviews;
                    setAverageScore(avgScore);
                } else {
                    setAverageScore(0);
                }
            } catch (error) {
                console.log(`Firebase: ${error}`);
            }
        };

        const fetchOffers = async () => {
            try {
                const offersCollection = collection(db, 'listings', listingID, 'offers');
                const offersSnap = await getDocs(offersCollection);
                
                if (!offersSnap.empty) {
                    const offersData = offersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setOffers(offersData);

                    const acceptedOffer = offersData.find(offer => offer.accepted === 'true');
                    const userOffer = offersData.find(offer => offer.userID === currentUser.uid);
                    if (acceptedOffer && userOffer) {
                        setOfferAccepted(true);
                    }
                }
            } catch (err) {
                console.log(err.message);
            }
        };

        fetchListing();
        checkIfLiked();
        fetchOffers();
    }, [listingID, currentUser]);

    //handle like and unlike
    const handleLike = async (e) => {
        e.stopPropagation();

        if (!currentUser) {
            toast.error("Please log in to like the product.");
            return;
        }

        try {
            const docRef = await addDoc(collection(db, 'Likes'), {
                userID: currentUser.uid,
                listingID: listingID
            });

            await addDoc(collection(db, 'Notifications'), {
                recipientID: listing.userID,
                senderID: currentUser.uid,
                listingID: listingID,
                type: 'like',
                read: false,
                timestamp: new Date()
            });

            const likeHistoryRef = collection(db, 'userHistory', currentUser.uid, 'likeHistory');
            const likeHistoryQuery = query(likeHistoryRef, where('listingID', '==', listingID));
            const querySnapshot = await getDocs(likeHistoryQuery);

            if (querySnapshot.empty) {
                await addDoc(collection(db, 'userHistory', currentUser.uid, 'likeHistory'), {
                    listing: listing.title,
                    listingID: listingID,
                    timestamp: new Date().toISOString()
                });
            }

            setIsLiked(true);
            setLikeID(docRef.id);
            increaseLikeCount();
        } catch (err) {
            toast.error('Error: ' + err.message);
        }
    };

    const handleUnLike = async (e) => {
        e.stopPropagation();

        try {
            await deleteDoc(doc(db, 'Likes', likeID));
            setIsLiked(false);
            setLikeID(null);
            decreaseLikeCount();
        } catch (err) {
            toast.error('Error: ' + err.message);
        }
    };

    //sell listing, delete listing
    const handleListingSold = async (e) => {
        e.preventDefault();

        try {
            await updateDoc(doc(db, 'listings', listingID), {
                status: 'sold',
                soldDate: new Date.toISOString()
            });
            setListingSold(true);

            const likesQuery = query(collection(db, 'Likes'), where('listingID', '==', listingID));
            const likesSnapshot = await getDocs(likesQuery);

            const notifications = likesSnapshot.docs.map((likeDoc) => {
                const likeData = likeDoc.data();
                return addDoc(collection(db, 'Notifications'), {
                    recipientID: likeData.userID,
                    senderID: currentUser.uid,
                    listingID: listingID,
                    type: 'sold',
                    read: false,
                    timestamp: new Date()
                });
            });

            await Promise.all(notifications);

            toast.success('Listing marked as sold and notifications sent successfully');
        } catch (err) {
            console.log(err.message);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        
        try {
            const likesQuery = query(collection(db, 'Likes'), where('listingID', '==', listingID));
            const likesSnapshot = await getDocs(likesQuery);

            const deletePromises = likesSnapshot.docs.map(async (likeDoc) => {
                const likeData = likeDoc.data();

                await deleteDoc(doc(db, 'Likes', likeDoc.id));
    
                const userLikeCountDoc = doc(db, 'Users', likeData.userID, 'likeCount', 'counter');
                const userLikeCountSnap = await getDoc(userLikeCountDoc);
                if (userLikeCountSnap.exists()) {
                    const currentCount = userLikeCountSnap.data().count;
                    await setDoc(userLikeCountDoc, { count: Math.max(currentCount - 1, 0) });
                }
            });

            await Promise.all(deletePromises);
            await deleteDoc(doc(db, 'listings', listingID));
            
            toast.success('Listing Successfully Deleted!');
            navigate('/');
        } catch (err) {
            console.log('Error: ' + err.message);
            toast.error('Error deleting listing: ' + err.message);
        }
    };

    // user profile stars
    const shownStars = (score) => {
        const stars = [];
        let i;
        for (i = 1; i <= 5; i++) {
            if (i <= score) {
                stars.push(<FaStar key={i} className="star-icon" />);
            } else if (i === Math.ceil(score) && score % 1 !== 0) {
                stars.push(<FaStarHalf key={i} className="star-icon" />);
            } else {
                stars.push(<FaStar key={i} className="star-empty" />);
            }
        }
        return stars;
    };

    const handleStartChat = async () => {
        const chatRef = collection(db, "Chats");
        const userChatsRef = collection(db, "UserChats");

        try {
			const currentUserChatsDoc = await getDoc(doc(userChatsRef, currentUser.uid)); 
            const existingChats = currentUserChatsDoc.exists() && currentUserChatsDoc.data().chats ? currentUserChatsDoc.data().chats : [];
			const existingChat = existingChats.find( chat => chat.receiverId === user.id ); 
			if (existingChat) { 
				navigate(`/chat/${currentUser.uid}/${existingChat.chatId}`);
			    return; 
      		} 

            const newChatRef = await addDoc(chatRef, {
                createdAt: new Date(),
                messages: [],
            });
    
      
			await updateDoc(doc(userChatsRef, user.id), {
				chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.uid,
                    updatedAt: Date.now(),
				}),
			});

			await updateDoc(doc(userChatsRef, currentUser.uid), {
				chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: user.id,
                    updatedAt: Date.now(),
				}),
			});

    		navigate(`/chat/${currentUser.uid}/${newChatRef.chatId}`);

		} catch (err) {
		  console.log(err);
		}
    };

    // useState changes
    const handleOpenPopup = () => {
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
    };

    const handleSubmit = () => {
        setIsPopupOpen(false);
    };

    const handleViewOffers = () => {
        setViewOffersPopupOpen(true);
    };

    const handleCloseViewOffers = () => {
        setViewOffersPopupOpen(false);
    };

    const handleAcceptOffer = () => {
        setIsPopupOpen(false);
        setOfferAccepted(true);
    };

    const handleRejectOffer = () => {
        setIsPopupOpen(false);
    };

    const handleOptionsClick = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // navigation
    const handleReviewUser = () => {
        navigate(`/review/${listingID}`);
    };

    const handleUsernameClick = () => {
        navigate(`/profile/${listing.userID}`);
    };

    const handleEditClick = () => {
        navigate(`/listing/${listingID}`);
    };

    // slick carousel
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
        <div>
            {listing && (
                <div className="listing-container">
                    <div className='listing-options'>
                        {currentUser?.uid === listing?.userID ? (
                            <>
                                <FaEllipsisVertical className='listing-ellipsis' onClick={handleOptionsClick} cursor='pointer' />
                                {dropdownOpen && (
                                    <div className="dropdown-content">
                                        {!listingSold && 
                                            <>
                                                <button onClick={handleEditClick}>Edit Listing</button>
                                                <button onClick={handleListingSold}>Mark as sold</button>
                                            </>
                                        }
                                        <button className='delete' onClick={handleDelete}>Delete Listing</button>
                                        {offers.length > 0 && <button onClick={handleViewOffers}>View Offers</button>}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {listing.status === 'available' && !offerAccepted && (
                                    <>
                                        <button className='offer-button' onClick={handleOpenPopup}>Make an offer</button>
                                        {isPopupOpen && (
                                            <OfferPopup
                                                onClose={handleClosePopup}
                                                onSubmit={handleSubmit}
                                                listingID={listingID}
                                                currentUser={currentUser}
                                                userID={listing.userID}
                                            />
                                        )}
                                    </>
                                )}
                                {offerAccepted && (
                                    <button className="review" onClick={handleReviewUser}>
                                        Review User
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                    <div className="listing-details">
                        <Slider {...settings}>
                            {(listing.images || [listing.image]).map((image, index) => (
                                <div key={index} className='listing-images'>
                                    <img src={image} alt={`Product image ${index + 1}`} />
                                </div>
                            ))}
                        </Slider>
                        <div className="listing-text">
                            <h1>{listing.title}</h1>
                            <div className='like-button'>
                                {isLiked ? (
                                    <FaHeart onClick={handleUnLike} color="red" />
                                ) : (
                                    <FaRegHeart onClick={handleLike} />
                                )}
                            </div>
                            <h2>${listing.price}</h2>
                            <h3>{listing.productType}</h3>
                            <h3>{timeSincePost(listing.postDate)}</h3>
                            <h4>Details:</h4>
                            <p>{listing.description}</p>
                        </div>
                    </div>
                </div>
            )}
            {user && (
                <div className='user-container'>
                    <div className='user-details'>
                        <img className='userpic'
                            src={user.profilePic}
                            alt={user.username}
                            onClick={handleUsernameClick}
                        />
                        <h4 onClick={handleUsernameClick}>{user.username}</h4>
                        {currentUser?.uid !== listing?.userID && (
                            <button onClick={handleStartChat} className='start-chat' style={{ marginLeft: '16px' }}>
                                <FaComment className="chat-icon" /> Start Chat
                            </button>
                        )}
                    </div>
                    <div className="user-reviews">
                        <div className="stars" onClick={handleUsernameClick}>
                            {shownStars(averageScore)}
                            <p>{averageScore.toFixed(1)} ({numberOfReviews} review{numberOfReviews !== 1 ? 's' : ''})</p>
                        </div>
                    </div>
                </div>
            )}
            {viewOffersPopupOpen && (
                <ViewOffers
                    onClose={handleCloseViewOffers}
                    listingID={listingID}
                    offers={offers}
                    onOfferAccept={handleAcceptOffer}
                    onOfferReject={handleRejectOffer}
                />
            )}
            <div className='viewproduct-footer'>
            {currentUser?.uid === listing?.userID ? (
                <SellerDashboard listingID={listingID}/>
            ) : (
                <SimilarProducts listingID={listingID} />
            )}
            </div>
        </div>
        } />
    );
}

export default ProductPage;