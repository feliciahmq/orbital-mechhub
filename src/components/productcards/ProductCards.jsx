import React, { useEffect, useState } from 'react';
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, doc, getDoc, setDoc, deleteDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../Auth'; 
import { useLikes } from '../header/likecounter/LikeCounter';

import './ProductCards.css';

function ProductCards({ productDetail }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeID, setLikeID] = useState(null); 
  const { likesCount, increaseLikeCount, decreaseLikeCount } = useLikes();
  const [soldStatus, setSoldStatus] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userDocRef = doc(db, 'Users', productDetail.userID);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        setUser(userDocSnap.data());
      }
      setSoldStatus(userDocSnap.data().status === 'sold');
    };

    const checkIfLiked = async () => {
      if (currentUser) {
        const likesQuery = query(
          collection(db, 'Likes'),
          where('userID', '==', currentUser.uid),
          where('listingID', '==', productDetail.id)
        );
        const likesSnapshot = await getDocs(likesQuery);
        if (!likesSnapshot.empty) {
          setIsLiked(true);
          setLikeID(likesSnapshot.docs[0].id); 
        }
      }
    };

    fetchUser();
    checkIfLiked();
  }, [productDetail.userID, productDetail.id, currentUser]);

  const trackClick = async () => {
    if (currentUser && currentUser.uid !== productDetail.userID) {
      const clickCountDoc = doc(db, 'listings', productDetail.id, 'clickCount', 'counter');
      const clickCountDocSnapshot = await getDoc(clickCountDoc);

      if (clickCountDocSnapshot.exists()) {
        try {
          await updateDoc(clickCountDoc, {
            count: clickCountDocSnapshot.data().count + 1
          });
        } catch (err) {
          console.error('Error updating click count: ', err);
        }
      } else {
        try {
          await setDoc(clickCountDoc, {
            count: 1,
          });
        } catch (err) {
          console.error('Error creating click count: ', err);
        }
      }
    }
  };

  const handleViewClick = () => {
    trackClick();
    navigate(`/product/${productDetail.id}`);
  };

  const handleUsernameClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${productDetail.userID}`);
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
        listingID: productDetail.id 
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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="product" onClick={handleViewClick}>
      <img alt={productDetail.title} src={productDetail.image} />
      <h4>{productDetail.title}</h4>
      <h5>{productDetail.productType}</h5>
      <p>${productDetail.price}</p>
      <div className="product-profile">
        <img
          className="profile-pic"
          src={user.profilePic}
          alt={user.username}
          onClick={handleUsernameClick}
        />
        <p onClick={handleUsernameClick}>{user.username}</p>
      </div>
      <div className="productcard-like-button">
        {isLiked ? (
          <FaHeart  role="button" name='pc-like' onClick={handleUnLike} color="red" /> 
        ) : (
          <FaRegHeart name='pc-unlike' role="button" onClick={handleLike} /> 
        )}
      </div>
    </div>
  );
}

export default ProductCards;