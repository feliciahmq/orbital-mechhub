import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ViewOffers from '../../../src/pages/viewproduct/viewOffers/viewOffers';
import { useAuth } from '../../../src/Auth';
import { useNavigate } from 'react-router-dom';
import { getDoc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import '@testing-library/jest-dom';

jest.mock('../../../src/Auth', () => ({
    useAuth: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

jest.mock('../../../src/lib/firebaseConfig', () => ({
    db: {},
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    addDoc: jest.fn(),
    collection: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
    toast: {
        success: jest.fn(),
    },
}));

describe('ViewOffers', () => {
    const mockOnClose = jest.fn();
    const mockOnOfferAccept = jest.fn();
    const mockOnOfferReject = jest.fn();
    const mockNavigate = jest.fn();
    const mockCurrentUser = { uid: 'currentUserID' };

    const mockOffers = [
        { id: '1', userID: 'user1', offerPrice: '100', comments: 'Offer 1', accepted: '' },
        { id: '2', userID: 'user2', offerPrice: '200', comments: 'Offer 2', accepted: 'true' },
    ];

    beforeEach(() => {
        useAuth.mockReturnValue({ currentUser: mockCurrentUser });
        useNavigate.mockReturnValue(mockNavigate);
        getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ username: 'TestUser', profilePic: 'test.jpg' }),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders offers correctly', async () => {
        render(
        <ViewOffers
            onClose={mockOnClose}
            listingID="testListing"
            offers={mockOffers}
            onOfferAccept={mockOnOfferAccept}
            onOfferReject={mockOnOfferReject}
        />
        );

        await waitFor(() => {
        expect(screen.getByText('$100')).toBeInTheDocument();
        expect(screen.getByText('$200')).toBeInTheDocument();
        expect(screen.getByText('Offer 1')).toBeInTheDocument();
        expect(screen.getByText('Offer 2')).toBeInTheDocument();
        });
    });

    it('handles accepting an offer', async () => {
        render(
        <ViewOffers
            onClose={mockOnClose}
            listingID="testListing"
            offers={mockOffers}
            onOfferAccept={mockOnOfferAccept}
            onOfferReject={mockOnOfferReject}
        />
        );

        await waitFor(() => {
        const acceptButton = screen.getByText('Accept');
        fireEvent.click(acceptButton);
        });

        expect(updateDoc).toHaveBeenCalled();
        expect(addDoc).toHaveBeenCalled();
        expect(mockOnOfferAccept).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalled();
    });

    it('handles rejecting an offer', async () => {
        render(
        <ViewOffers
            onClose={mockOnClose}
            listingID="testListing"
            offers={mockOffers}
            onOfferAccept={mockOnOfferAccept}
            onOfferReject={mockOnOfferReject}
        />
        );

        await waitFor(() => {
        const rejectButton = screen.getByText('Reject');
        fireEvent.click(rejectButton);
        });

        expect(deleteDoc).toHaveBeenCalled();
        expect(addDoc).toHaveBeenCalled();
        expect(mockOnOfferReject).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalled();
    });

    it('navigates to user profile on username click', async () => {
        render(
          <ViewOffers
            onClose={mockOnClose}
            listingID="testListing"
            offers={mockOffers}
            onOfferAccept={mockOnOfferAccept}
            onOfferReject={mockOnOfferReject}
          />
        );
      
        await waitFor(() => {
          const usernameElements = screen.getAllByText('TestUser');

          fireEvent.click(usernameElements[0]);
        });
      
        expect(mockNavigate).toHaveBeenCalledWith('/profile/user1');
    });

    it('closes the popup when close button is clicked', () => {
        render(
        <ViewOffers
            onClose={mockOnClose}
            listingID="testListing"
            offers={mockOffers}
            onOfferAccept={mockOnOfferAccept}
            onOfferReject={mockOnOfferReject}
        />
        );

        const closeButton = screen.getByText('X');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });
});