import React from 'react';
import './ProductCards.css';

function Product({ productDetail }) {
  return (
    <div className="product">
      <img alt={productDetail.title} src={productDetail.image} />
      <h4>{productDetail.title}</h4>
      <h5>{productDetail.productType}</h5>
      <p>${productDetail.price}</p>
      <button>View</button>
    </div>
  );
}

export default Product;
