import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import ProductCards from './ProductCards';
import './ProductCards.css';

function ProductList({heading}) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'listings'));
      const productsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
    };

    fetchProducts();
  }, []);

  return (
    <>
      <h2>{heading}</h2>
      <div className="product-list">
        {products.map(productDetail => (
          <ProductCards key={productDetail.id} productDetail={productDetail} />
        ))}
      </div>
    </>
  );
}

export default ProductList;
