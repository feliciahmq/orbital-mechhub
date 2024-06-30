import LandingPage from '../../../src/pages/landing/LandingPage';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '../../../src/Auth';
import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

jest.mock('../../../src/Auth');
jest.mock('firebase/firestore');
jest.mock('../../../src/lib/firebaseConfig');
jest.mock( '../../../src/components/Header/likecounter/LikeCounter', () => ({
    useLikes: jest.fn(() => ({ likeCount: 50 }))
}));

const mockListings = [
    {
        id: '1',
        title: 'Product 1',
        weeklyClicks: 10,
        likes: 1,
        offers: 2
    },
    {
        id: '2',
        title: 'Product 2',
        weeklyClicks: 20,
        likes: 1,
        offers: 2
    },
    {
        id: '3',
        title: 'Product 3',
        weeklyClicks: 30,
        likes: 1,
        offers: 2
    }
];

const mockGetDocs = jest.fn().mockResolvedValue({
    docs: mockListings.map(listing => ({
        id: listing.id,
        data: () => listing,
    }))
});

const mockGetDoc = jest.fn().mockResolvedValue({
    exists: () => true,
    data: () => ({ count: 10 })
});

collection.mockImplementation((...args) => args.join('/'));
query.mockImplementation((...args) => args);
where.mockImplementation(() => {});
getDocs.mockImplementation(mockGetDocs);
getDoc.mockImplementation(mockGetDoc);

describe('LandingPage', () => {
    beforeEach(() => {
        useAuth.mockReturnValue({
            currentUser: { uid: 'test-user' }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders LandingPage with header, banner, and product list', async () => {
        render(
            <MemoryRouter>
                <LandingPage />
            </MemoryRouter>
        );

        expect(screen.getByText("My Keyboard Quit Its Job")).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /View All Products/ })).toBeInTheDocument();
        expect(screen.getByText("Featured Products")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("Product 1")).toBeInTheDocument();
            expect(screen.getByText("Product 2")).toBeInTheDocument();
        });
    });

    test('fetches and displays listings from Firebase', async () => {
        render(
            <MemoryRouter>
                <LandingPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockGetDocs).toHaveBeenCalledTimes(5 + 3 * (mockListings.length - 1));
            expect(mockGetDoc).toHaveBeenCalledTimes(mockListings.length * 3);
        });
    });
});