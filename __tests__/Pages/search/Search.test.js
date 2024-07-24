import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../../src/Auth';
import { collection, getDocs, query, where, getDoc } from 'firebase/firestore';
import SearchPage from '../../../src/pages/search/SearchPage';
import '@testing-library/jest-dom';

jest.mock('firebase/firestore');
jest.mock('../../../src/Auth');
jest.mock('../../../src/lib/firebaseConfig', () => ({
  db: {},
}));
jest.mock('../../../src/components/header/Header', () => () => <div>Header</div>);
jest.mock('../../../src/components/productcards/ProductList', () => ({ products }) => (
  <div>ProductList: {products.length} products</div>
));
jest.mock('../../../src/components/listingpopup/Button', () => () => <div>ListingButton</div>);
jest.mock('../../../src/pages/search/filter/productFilter', () => ({ onFilterChange, onSortChange }) => (
    <div>
        <button onClick={() => onFilterChange('keycaps', [0, 1000])}>Filter</button>
        <button onClick={() => onSortChange('low-to-high')}>Sort</button>
    </div>
));

describe('SearchPage', () => {
    beforeEach(() => {
        getDocs.mockResolvedValue({
        docs: [
            { id: '1', data: () => ({ title: 'Product 1', price: 100, productType: 'keycaps' }) },
            { id: '2', data: () => ({ title: 'Product 2', price: 200, productType: 'switches' }) },
        ],
        });
        getDoc.mockResolvedValue({ exists: () => true, data: () => ({ count: 5 }) });
        useAuth.mockReturnValue({ currentUser: { uid: '123' } });
    });

    test('renders SearchPage components', async () => {
        render(
        <BrowserRouter>
            <SearchPage />
        </BrowserRouter>
        );

        await waitFor(() => {
        expect(screen.getByText('Header')).toBeInTheDocument();
        expect(screen.getByText(/ProductList:/)).toBeInTheDocument();
        expect(screen.getByText('ListingButton')).toBeInTheDocument();
        });
    });

    test('filters products', async () => {
        render(
        <BrowserRouter>
            <SearchPage />
        </BrowserRouter>
        );

        await waitFor(() => {
        expect(screen.getByText('ProductList: 2 products')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Filter'));

        await waitFor(() => {
        expect(screen.getByText('ProductList: 1 products')).toBeInTheDocument();
        });
    });

    test('sorts products', async () => {
        render(
        <BrowserRouter>
            <SearchPage />
        </BrowserRouter>
        );

        await waitFor(() => {
        expect(screen.getByText('ProductList: 2 products')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Sort'));
        expect(screen.getByText('ProductList: 2 products')).toBeInTheDocument();
    });
});