import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfile from '../../../src/pages/userprofile/UserProfile';
import { useAuth } from '../../../src/Auth';
import { useParams, useNavigate } from 'react-router-dom';

jest.mock('../../../src/lib/firebaseConfig', () => ({
    auth: {},
    db: {},
    storage: {},
}));

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
    useNavigate: jest.fn(),
}));

jest.mock('../../../src/Auth', () => ({
    useAuth: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    collection: jest.fn(),
    where: jest.fn(),
}));

jest.mock('../../../src/components/header/Header', () => () => <div data-testid="header">Header</div>);
jest.mock('../../../src/components/listingpopup/Button', () => () => <div data-testid="listing-button">Listing Button</div>);
jest.mock('../../../src/components/productcards/ProductList', () => ({ heading, products }) => (
    <div data-testid="product-list">
        <h2>{heading}</h2>
        <p>Products: {products.length}</p>
    </div>
));
jest.mock('../../../src/pages/userprofile/userReviews/ReviewList', () => ({ heading, reviews }) => (
    <div data-testid="review-list">
        <h2>{heading}</h2>
        <p>Reviews: {reviews.length}</p>
    </div>
));

describe('UserProfile Component', () => {
    const mockUserInfo = {
        username: 'testuser',
        profilePic: 'test-profile-pic.jpg',
        signUpDate: '2023-01-01T00:00:00.000Z',
        followCount: 10,
        followingCount: 5,
    };

    const mockUserListings = [
        { id: '1', data: () => ({ title: 'Product 1', price: 100, productType: 'keycaps' }) },
        { id: '2', data: () => ({ title: 'Product 2', price: 200, productType: 'switches' }) },
    ];
    const mockUserReviews = [
        { id: '1', score: 4, details: 'Review 1' },
        { id: '2', score: 5, details: 'Review 2' },
    ];

    beforeEach(() => {
        useParams.mockReturnValue({ userID: 'testUserID' });
        useNavigate.mockReturnValue(jest.fn());
        useAuth.mockReturnValue({ currentUser: { uid: 'currentUserID' } });

        const { getDoc, getDocs, query } = require('firebase/firestore');
        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => mockUserInfo,
        });

        getDocs.mockResolvedValue({
            docs: mockUserListings.map(listing => ({
                id: listing.id,
                data: () => listing.data(),
            })),
        });
        query.mockReturnValue({});
        getDocs.mockResolvedValueOnce({ docs: [] });
    });

    it('renders user profile information', async () => {
        render(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByText('@testuser')).toBeInTheDocument();
            expect(screen.getByText(/Joined/)).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument();
        });
    });

    it('renders user listings', async () => {
        render(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByTestId('product-list')).toBeInTheDocument();
            expect(screen.getByText(/Products: 2/)).toBeInTheDocument();
        });
    });

    it('toggles between listings and reviews', async () => {
        render(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByTestId('product-list')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Reviews'));

        await waitFor(() => {
            expect(screen.getByText(/This user has no reviews/)).toBeInTheDocument();
        });
    });

    it('shows follow or unfollow button for other users', async () => {
        useAuth.mockReturnValue({ currentUser: { uid: 'differentUserID' } });

        render(<UserProfile />);

        await waitFor(() => {
            const followButton = screen.getByRole('button', { name: /Follow|Unfollow/ });
            expect(followButton).toBeInTheDocument();
        });
    });

    it('shows edit profile and logout buttons for current user', async () => {
        useAuth.mockReturnValue({ currentUser: { uid: 'testUserID' } });

        render(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByText('Edit Profile')).toBeInTheDocument();
            expect(screen.getByText('Logout')).toBeInTheDocument();
        });
    });
});