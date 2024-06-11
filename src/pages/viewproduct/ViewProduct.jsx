import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../Auth';
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useLikes } from '../../components/header/likecounter/LikeCounter';

import Header from '../../components/header/Header';
import './ViewProduct.css';

function ProductPage() {
  const { listingID } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [listing, setListing] = useState(null);
  const [user, setUser] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeID, setLikeID] = useState(null);
  const { likesCount, increaseLikeCount, decreaseLikeCount } = useLikes();

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
        }
      } else {
        console.log('There is Such No Listing');
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

    fetchListing();
    checkIfLiked();
  }, [listingID, currentUser]);

  const handleUsernameClick = () => {
    navigate(`/profile/${listing.userID}`);
  };

  const handleEditClick = () => {
    navigate(`/listing/${listingID}`);
  };

  const handleLike = async (e) => {
    e.stopPropagation();

    if (!currentUser) {
      alert("Please log in to like the product.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'Likes'), {
        userID: currentUser.uid,
        listingID: listingID
      });

      setIsLiked(true);
      setLikeID(docRef.id);
      increaseLikeCount();
    } catch (err) {
      alert('Error: ' + err.message);
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
      alert('Error: ' + err.message);
    }
  };

  return (
    <>
      <Header />
      {listing && (
        <div className="listing-container">
          <div className="listing-details">
            <img src={listing.image} alt={listing.title} />
            <div className="listing-text">
              <h1>{listing.title}</h1>
              <h2>${listing.price}</h2>
              <h3>{listing.productType}</h3>
              <h4>Details:</h4>
              <p>{listing.description}</p>
            </div>
            <div className='like-button'>
              {isLiked ? (
                <FaHeart onClick={handleUnLike} color="red" />
              ) : (
                <FaRegHeart onClick={handleLike} />
              )}
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
          </div>
          {currentUser?.uid === listing?.userID && (
            <button onClick={handleEditClick}>Edit Listing</button>
          )}
        </div>
      )}
    </>
  );
}

export default ProductPage;
