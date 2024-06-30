import UserReviews from '../../../src/pages/userprofile/userReviews/UserReviews';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import '@testing-library/jest-dom';

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../src/lib/firebaseConfig', () => ({
  db: {},
}));

describe('UserReviews Component', () => {
    const mockReviewDetails = {
        userID: 'testUserID',
        score: 4,
        details: 'Great product!',
        image: 'test-image-url.jpg',
    };

    const mockUser = {
        username: 'TestUser',
        profilePic: 'test-profile-pic.jpg',
    };

    beforeEach(() => {
        getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUser,
        });
    });

    it('renders user review correctly', async () => {
        render(
        <BrowserRouter>
            <UserReviews reviewDetails={mockReviewDetails} />
        </BrowserRouter>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
        expect(screen.getByText(mockUser.username)).toBeInTheDocument();
        });

        expect(screen.getByText(mockReviewDetails.details)).toBeInTheDocument();

        const filledStars = screen.getAllByTestId('filled-star');
        const emptyStars = screen.getAllByTestId('empty-star');
        expect(filledStars).toHaveLength(mockReviewDetails.score);
        expect(emptyStars).toHaveLength(5 - mockReviewDetails.score);

        const reviewImage = screen.getByAltText('Review');
        expect(reviewImage).toBeInTheDocument();
        expect(reviewImage).toHaveAttribute('src', mockReviewDetails.image);
    });

    it('navigates to user profile when username is clicked', async () => {
        render(
        <BrowserRouter>
            <UserReviews reviewDetails={mockReviewDetails} />
        </BrowserRouter>
        );

        await waitFor(() => {
        expect(screen.getByText(mockUser.username)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(mockUser.username));

        expect(mockNavigate).toHaveBeenCalledWith(`/profile/${mockReviewDetails.userID}`);
    });

    it('handles error when fetching user data', async () => {
        console.error = jest.fn(); 
        getDoc.mockRejectedValue(new Error('Failed to fetch user data'));

        render(
        <BrowserRouter>
            <UserReviews reviewDetails={mockReviewDetails} />
        </BrowserRouter>
        );

        await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
            'Error fetching user data: ',
            expect.any(Error)
        );
        });

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
});