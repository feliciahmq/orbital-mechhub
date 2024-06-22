import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../Auth';

import Header from '../../components/header/Header';
import ProductList from '../../components/productcards/ProductList';
import './Likes.css';

function LikesPage() {
  const { currentUser } = useAuth();
  const [likedProducts, setLikedProducts] = useState([]);

  useEffect(() => {
    const fetchLikedProducts = async () => {
      if (currentUser) {
        const likesQuery = query(
          collection(db, 'Likes'),
          where('userID', '==', currentUser.uid)
        );
        const likesSnapshot = await getDocs(likesQuery);
        const likedProductIDs = likesSnapshot.docs.map(doc => doc.data().listingID);

        const likedProductsData = await Promise.all(
          likedProductIDs.map(async (id) => {
            const productDocRef = doc(db, 'listings', id);
            const productDocSnap = await getDoc(productDocRef);
            if (productDocSnap.exists()) {
              return { id, ...productDocSnap.data() };
            }
            return null;
          })
        );

        setLikedProducts(likedProductsData.filter(product => product !== null));
      }
    };

    fetchLikedProducts();
  }, [currentUser]);

    return (

        <div className='content'>
            <Header />
            <div className='liked-products'>
                {likedProducts.length > 0 ? (
                    <ProductList heading='Liked Products' products={likedProducts} />
                ) : (
                    <h2>You have no liked products ( っ´ω｀c)</h2>
                )}
            </div>
            <div className='cart-checkout-area'> 
                {/* you can implement the stripe payment css here (can like maybe
                    allow users to choose what to checkout then redirect ? idk just
                    a suggestion lol) */}
                <h3>this section is for u (◍•ᴗ•◍)❤</h3>
            </div>
        </div>
    );
}

export default LikesPage;