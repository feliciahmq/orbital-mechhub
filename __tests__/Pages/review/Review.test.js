import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReviewPage from '../../../src/pages/review/Review';
import { useAuth } from '../../../src/Auth';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, addDoc, query, where } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useLikes } from '../../../src/components/header/likecounter/LikeCounter';

jest.mock('../../../src/Auth', () => ({
    useAuth: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
    useNavigate: jest.fn(),
}));

jest.mock('../../../src/components/header/likecounter/LikeCounter', () => ({
    useLikes: jest.fn().mockReturnValue({ likeCount: 2 }),
}));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    addDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

jest.mock('../../../src/lib/firebaseConfig', () => ({
    db: {},
}));

jest.mock('../../../src/components/header/Header', () => {
  return function DummyHeader() {
    return <div>Header</div>;
  };
});

describe('ReviewPage', () => {
    const mockCurrentUser = { uid: 'testUser123' };
    const mockNavigate = jest.fn();
    const mockUserID = 'listing789';
    const mockListerID = 'lister456';
    const mockListingName = 'Test Listing';

    beforeEach(() => {
        useAuth.mockReturnValue({ currentUser: mockCurrentUser });
        useParams.mockReturnValue({ userID: mockUserID });
        useNavigate.mockReturnValue(mockNavigate);

        getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
            userID: mockListerID,
            title: mockListingName,
        }),
        });
    });

    it('renders the review form', async () => {
        await act(async () => {
        render(<ReviewPage />);
        });

        await waitFor(() => {
        expect(screen.getByText('Leave a Review')).toBeInTheDocument();
        expect(screen.getByPlaceholderText("What's your experience?")).toBeInTheDocument();
        expect(screen.getByText('Submit Review')).toBeInTheDocument();
        });
    });

    it('handles star rating selection', async () => {
        await act(async () => {
        render(<ReviewPage />);
        });

        const fourthStar = await screen.findByTestId('star-icon-4');
        await act(async () => {
        fireEvent.click(fourthStar);
        });

        expect(fourthStar).toHaveStyle('color: #FF4B2B');
    });

    it('submits a review successfully', async () => {
        await act(async () => {
        render(<ReviewPage />);
        });

        const fourthStar = await screen.findByTestId('star-icon-4');
        const reviewText = screen.getByPlaceholderText("What's your experience?");
        const submitButton = screen.getByText('Submit Review');

        await act(async () => {
        fireEvent.click(fourthStar);
        fireEvent.change(reviewText, { target: { value: 'Great product!' } });
        fireEvent.click(submitButton);
        });

        await waitFor(() => {
        expect(addDoc).toHaveBeenCalledTimes(3);
        expect(toast.success).toHaveBeenCalledWith('Review Successfully Submitted!');
        expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('shows error when submitting without rating', async () => {
        render(<ReviewPage />);
    
        const submitButton = screen.getByText('Submit Review');
        fireEvent.click(submitButton);
    
        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Please provide a rating.');
        });
    });

    it('shows error when submitting without review text', async () => {
        render(<ReviewPage />);
    
        const fourthStar = await screen.findByTestId('star-icon-4');
        const submitButton = screen.getByText('Submit Review');
    
        fireEvent.click(fourthStar);
        fireEvent.click(submitButton);
    
        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Please Fill in All Fields');
        });
    });
});