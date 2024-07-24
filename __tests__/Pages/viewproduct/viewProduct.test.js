import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductPage from '../../../src/pages/viewproduct/ViewProduct';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../src/Auth';
import { useLikes } from '../../../src/components/header/likecounter/LikeCounter';
import { doc, getDoc, addDoc, collection, deleteDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), 
        removeListener: jest.fn(), 
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

jest.mock('react-slick', () => () => 
    <div>Slider Mock</div>
);

jest.mock('slick-carousel/slick/slick.css', () => ({}));

jest.mock('slick-carousel/slick/slick-theme.css', () => ({}));

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('../../../src/Auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../src/components/header/likecounter/LikeCounter', () => ({
    useLikes: jest.fn(),
}));

jest.mock('firebase/firestore');

jest.mock('react-hot-toast', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

jest.mock('../../../src/components/header/Header', () => () => 
    <div data-testid="mock-header">Header</div>
);

describe('ProductPage', () => {
    const mockListing = {
        id: 'testListing',
        title: 'Test Product',
        price: '100',
        productType: 'Test Type',
        description: 'Test Description',
        userID: 'testUser',
        postDate: new Date().toISOString(),
        image: 'test-image.jpg',
        status: 'available',
    };

    const mockUser = {
        username: 'TestUser',
        profilePic: 'test-profile.jpg',
    };

    beforeEach(() => {
        useParams.mockReturnValue({ listingID: 'testListing' });
        useNavigate.mockReturnValue(jest.fn());
        useAuth.mockReturnValue({ currentUser: { uid: 'currentUser' } });
        useLikes.mockReturnValue({ likesCount: 0, increaseLikeCount: jest.fn(), decreaseLikeCount: jest.fn() });

        getDoc.mockResolvedValueOnce({ exists: () => true, data: () => mockListing });
        getDoc.mockResolvedValueOnce({ exists: () => true, data: () => mockUser });
        getDocs.mockResolvedValue({ empty: true });
    });

    it('renders the product details correctly', async () => {
        render(<ProductPage />);

        await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('$100')).toBeInTheDocument();
        expect(screen.getByText('Test Type')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        });
    });

    it('handles like functionality', async () => {
        render(<ProductPage />);

        await waitFor(() => {
        const likeButton = screen.getByTestId('like-button');
        fireEvent.click(likeButton);
        });

        expect(addDoc).toHaveBeenCalled();
    });

    it('handles unlike functionality', async () => {
        getDocs.mockResolvedValueOnce({ empty: false, docs: [{ id: 'likeId', data: () => ({}) }] });

        render(<ProductPage />);

        await waitFor(() => {
        const unlikeButton = screen.getByTestId('unlike-button');
        fireEvent.click(unlikeButton);
        });

        expect(deleteDoc).toHaveBeenCalled();
    });

    it('handles marking listing as sold', async () => {
        useAuth.mockReturnValue({ currentUser: { uid: 'testUser' } });

        render(<ProductPage />);

        await waitFor(() => {
        const optionsButton = screen.getByTestId('options-button');
        fireEvent.click(optionsButton);
        });

        const markAsSoldButton = screen.getByText('Mark as sold');
        fireEvent.click(markAsSoldButton);

        expect(updateDoc).toHaveBeenCalled();
    });

    it('handles deleting listing', async () => {
        useAuth.mockReturnValue({ currentUser: { uid: 'testUser' } });

        render(<ProductPage />);

        await waitFor(() => {
        const optionsButton = screen.getByTestId('options-button');
        fireEvent.click(optionsButton);
        });

        const deleteButton = screen.getByText('Delete Listing');
        fireEvent.click(deleteButton);

        expect(deleteDoc).toHaveBeenCalled();
    });
});