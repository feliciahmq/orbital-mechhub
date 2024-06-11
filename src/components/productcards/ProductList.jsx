import React from 'react';
import ProductCards from './ProductCards';
import './ProductCards.css';

function ProductList({ heading, products }) {
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
