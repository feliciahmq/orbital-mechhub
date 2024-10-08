import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebaseConfig';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../Auth';

import Format from '../../components/format/Format';
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
        <Format content={
        <div className='content'>
            <div className='liked-products'>
                {likedProducts.length > 0 ? (
                    <ProductList heading='Liked Products' products={likedProducts} />
                ) : (
                    <h2>You have no liked products ( っ´ω｀c)</h2>
                )}
            </div>
        </div>
        } />
    );
}

export default LikesPage;