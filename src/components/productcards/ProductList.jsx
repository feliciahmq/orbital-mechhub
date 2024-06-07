import Product from "./ProductCards";

function ProductList({ heading, products }) {
  return (
    <>
      <h2>{heading}</h2>
      <div className="products-list">
        {products.map((product) => (
          <Product key={product.id} productDetail={product} />
        ))}
      </div>
    </>
  );
}

export default ProductList;