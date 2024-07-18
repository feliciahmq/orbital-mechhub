import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OfferPopup from '../../../src/pages/viewproduct/offerPopup/offerPopup';
import { addDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

jest.mock('../../../src/lib/firebaseConfig', () => ({
    db: {},
}));
jest.mock('firebase/firestore', () => ({
    addDoc: jest.fn(),
    collection: jest.fn(),
}));
jest.mock('react-hot-toast', () => ({
    toast: {
        success: jest.fn(),
    },
}));

describe('OfferPopup', () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();
    const mockListingID = 'mock-listing-id';
    const mockCurrentUser = { uid: 'mock-user-id' };
    const mockUserID = 'mock-seller-id';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders form correctly', () => {
        render(
        <OfferPopup
            onClose={mockOnClose}
            onSubmit={mockOnSubmit}
            listingID={mockListingID}
            currentUser={mockCurrentUser}
            userID={mockUserID}
        />
        );

        expect(screen.getByLabelText('Offer Price:')).toBeInTheDocument();
        expect(screen.getByLabelText('Comments:')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Submit Offer' })).toBeInTheDocument();
    });

    it('handles input changes', () => {
        render(
        <OfferPopup
            onClose={mockOnClose}
            onSubmit={mockOnSubmit}
            listingID={mockListingID}
            currentUser={mockCurrentUser}
            userID={mockUserID}
        />
        );

        const offerPriceInput = screen.getByLabelText('Offer Price:');
        const commentsInput = screen.getByLabelText('Comments:');

        fireEvent.change(offerPriceInput, { target: { value: '100.50' } });
        fireEvent.change(commentsInput, { target: { value: 'Test comment' } });

        expect(offerPriceInput).toHaveValue('100.50');
        expect(commentsInput).toHaveValue('Test comment');
    });

    it('submits the form correctly', async () => {
        addDoc.mockResolvedValueOnce({});

        render(
        <OfferPopup
            onClose={mockOnClose}
            onSubmit={mockOnSubmit}
            listingID={mockListingID}
            currentUser={mockCurrentUser}
            userID={mockUserID}
        />
        );

        const offerPriceInput = screen.getByLabelText('Offer Price:');
        const commentsInput = screen.getByLabelText('Comments:');
        const submitButton = screen.getByRole('button', { name: 'Submit Offer' });

        fireEvent.change(offerPriceInput, { target: { value: '100.50' } });
        fireEvent.change(commentsInput, { target: { value: 'Test comment' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
        expect(addDoc).toHaveBeenCalledTimes(2);
        expect(mockOnSubmit).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Offer Sent!');
        });
    });

    it('closes the popup when close button is clicked', () => {
        render(
        <OfferPopup
            onClose={mockOnClose}
            onSubmit={mockOnSubmit}
            listingID={mockListingID}
            currentUser={mockCurrentUser}
            userID={mockUserID}
        />
        );

        const closeButton = screen.getByRole('button', { name: 'X' });
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });
});