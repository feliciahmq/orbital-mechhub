import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LikesPage from '../../../src/pages/likes/Likes';
import { useAuth } from '../../../src/Auth';
import { db } from '../../../src/lib/firebaseConfig';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

jest.mock('../../../src/Auth', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../../src/lib/firebaseConfig', () => ({
    db: {},
}));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
}));

jest.mock('../../../src/components/header/Header', () => {
    return function DummyHeader() {
        return <div data-testid="header">Header</div>;
    };
});

jest.mock('../../../src/components/productcards/ProductList', () => {
    return function DummyProductList({ heading, products }) {
        return (
            <div data-testid="product-list">
                <h2>{heading}</h2>
                <ul>
                {products.map((product) => (
                    <li key={product.id}>{product.name}</li>
                ))}
                </ul>
            </div>
        );
    };
});

describe('LikesPage', () => {
    beforeEach(() => {
        useAuth.mockReturnValue({ currentUser: { uid: 'testUserID' } });
    });

    it('renders the header', async () => {
        render(<LikesPage />);
        expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('displays liked products when user has liked products', async () => {
        const mockLikedProducts = [
            {
                id: '1',
                details: {
                    title: 'Product 1',
                    weeklyClicks: 10,
                    likes: 1,
                    offers: 2
                }
            },
            {
                id: '2',
                details: {
                    title: 'Product 2',
                    weeklyClicks: 20,
                    likes: 1,
                    offers: 2
                }
            },
            {
                id: '3',
                details: {
                    title: 'Product 3',
                    weeklyClicks: 30,
                    likes: 1,
                    offers: 2
                }
            }
        ];        

        getDocs.mockResolvedValue({
            docs: [
                { data: () => ({ userID: 'testUserID', listingID: '1' }) },
                { data: () => ({ userID: 'testUserID', listingID: '2' }) },
            ],
        });

        getDoc.mockImplementation((docRef) => ({
            exists: () => true,
            data: () => mockLikedProducts.find(p => p.id === docRef.id),
        }));

        render(<LikesPage />);

        await waitFor(() => {
            expect(screen.getByText('Liked Products')).toBeInTheDocument();
            expect(screen.getByText('Product 1')).toBeInTheDocument();
            expect(screen.getByText('Product 2')).toBeInTheDocument();
        });
    });

    it('displays a message when user has no liked products', async () => {
        getDocs.mockResolvedValue({
            docs: [],
        });

        render(<LikesPage />);

        await waitFor(() => {
            expect(screen.getByText('You have no liked products ( っ´ω｀c)')).toBeInTheDocument();
        });
    });

    it('renders the cart checkout area', async () => {
        render(<LikesPage />);
        expect(screen.getByText('this section is for stripe (◍•ᴗ•◍)❤')).toBeInTheDocument();
    });
});