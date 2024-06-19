import ProductList from '../../../src/components/productcards/ProductList';
import ProductCards from '../../../src/components/productcards/ProductCards';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../../../src/components/productcards/ProductCards', () => ({ productDetail }) => (
  <div data-testid="product-card">{productDetail.title}</div>
));

const products = [
  { id: '1', title: 'Product 1', productType: 'Type 1', price: 10, image: 'image1.jpg', userID: 'user1' },
  { id: '2', title: 'Product 2', productType: 'Type 2', price: 20, image: 'image2.jpg', userID: 'user2' },
];

test('renders heading and product list', () => {
  const heading = 'Test Heading';

  render(<ProductList heading={heading} products={products} />);

  expect(screen.getByText(heading)).toBeInTheDocument();

  const productCards = screen.getAllByTestId('product-card');
  expect(productCards).toHaveLength(products.length);

  products.forEach((product, index) => {
    expect(productCards[index]).toHaveTextContent(product.title);
  });
});
