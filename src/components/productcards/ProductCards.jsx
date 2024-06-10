import React from 'react';
import './ProductCards.css';
import { useNavigate } from 'react-router-dom';

function ProductCards({ productDetail }) {
  const navigate = useNavigate();

  const handleViewClick = () => {
    navigate(`/product/${productDetail.id}`);
  };

  return (
    <div className="product">
      <img alt={productDetail.title} src={productDetail.image} />
      <h4>{productDetail.title}</h4>
      <h5>{productDetail.productType}</h5>
      <p>${productDetail.price}</p>
      <p>username</p>
      <button onClick={handleViewClick}>View</button>
    </div>
  );
}

export default ProductCards;
