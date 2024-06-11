import React, { useEffect, useState } from 'react';
import { FaRegHeart } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

import './ProductCards.css';


function ProductCards({ productDetail }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userDocRef = doc(db, 'Users', productDetail.userID);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        setUser(userDocSnap.data());
      }
    };

    fetchUser();
  }, [productDetail.userID]);

  const handleViewClick = () => {
    navigate(`/product/${productDetail.id}`);
  };

  const handleUsernameClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${productDetail.userID}`);
  };

  const handleLike = (e) => {

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
        <FaRegHeart onClick={handleLike}/>
      </div>
    </div>
  );
}

export default ProductCards;
