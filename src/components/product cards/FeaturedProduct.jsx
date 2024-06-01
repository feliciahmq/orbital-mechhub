import "./FeaturedProduct.css";


function Product({ productDetail = productDetail1 }) {
  return (
    <div className="product">
      <img alt={productDetail.title} src={productDetail.thumbnail} />
      <h4>{productDetail.title}</h4>
      <h5>{productDetail.brand}</h5>
      <p>{productDetail.price}</p>
      <button>Add to Cart</button>
    </div>
  );
}

export default Product;