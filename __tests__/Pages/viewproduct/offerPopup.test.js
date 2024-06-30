import OfferPopup from "../../../src/pages/viewproduct/offerPopup/offerPopup";
import React from "react";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe } from "test";
import { auth, db } from '../../../src/lib/firebaseConfig';
import { getDoc } from 'firebase/firestore';

jest.mock('../../../src/lib/firebaseConfig', () => ({
    auth: { currentUser: { uid: 'testuid' }, onAuthStateChanged: jest.fn() },
    db: {},
}));
jest.mock('firebase/firestore');

describe('OfferPopup', () => {
    const mockOnOfferSubmit = jest.fn();
    const mockOnOfferClose = jest.fn();

    const getFormControlByLabel = (labelText) => {
        return screen.getByLabelText(labelText, { 
            selector: 'input, textarea, select' 
        });
    };

    beforeEach(() => {
        auth.onAuthStateChanged.mockImplementation((callback) => callback({ uid: 'testuid' }));

        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({
                offerPrice: "",
                comments: ""
            })
        });
    });

    test('renders OfferPopup', async () => {
        await act(async () => {
            render(<OfferPopup onClose={mockOnOfferClose} onSubmit={mockOnOfferSubmit} />);
        });

        await waitFor(() => {
            expect(getFormControlByLabel('Offer Price:')).toBeInTheDocument();
            expect(getFormControlByLabel('Comments:')).toBeInTheDocument();
        });
    });

    test('submits the form correctly', async () => {
        await act(async () => {
            render(<OfferPopup onClose={mockOnOfferClose} onSubmit={mockOnOfferSubmit} />);
        });

        const offerPriceInput = getFormControlByLabel('Offer Price:');
        const commentsInput = getFormControlByLabel('Comments:');

        fireEvent.change(offerPriceInput, { target: { value: '100' } });
        fireEvent.change(commentsInput, { target: { value: 'Test comment' } });

        await act(async () => {
            fireEvent.submit(screen.getByRole('button', { name: /submit offer/i }));
        });

        await waitFor(() => {
            expect(mockOnOfferSubmit).toHaveBeenCalled();
        });
    });
});