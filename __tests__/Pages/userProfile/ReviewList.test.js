import ReviewList from "../../../src/pages/userprofile/userReviews/ReviewList";
import React from "react";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../../../src/pages/userprofile/userReviews/UserReviews', () => {
    return function MockUserReviews({ reviewDetails }) {
        return <div data-testid="user-review">{reviewDetails.id}</div>;
    };
});

describe('ReviewList Component', () => {
    const mockProps = {
        heading: 'Test Reviews',
        reviews: [
        { id: '1', details: 'Review 1' },
        { id: '2', details: 'Review 2' },
        { id: '3', details: 'Review 3' },
        ],
        averageScore: 3.7,
        numberOfReviews: 3,
    };

    it('renders the component correctly', () => {
        render(<ReviewList {...mockProps} />);

        expect(screen.getByText('Test Reviews')).toBeInTheDocument();

        expect(screen.getByText('Average Score: 3.7 / 5')).toBeInTheDocument();

        expect(screen.getByText('(3 reviews)')).toBeInTheDocument();

        const filledStars = screen.getAllByTestId('filled-star');
        const halfStars = screen.getAllByTestId('half-star');
        const emptyStars = screen.getAllByTestId('empty-star');
        expect(filledStars).toHaveLength(3);
        expect(halfStars).toHaveLength(1);
        expect(emptyStars).toHaveLength(1);

        const userReviews = screen.getAllByTestId('user-review');
        expect(userReviews).toHaveLength(3);
        expect(userReviews[0]).toHaveTextContent('1');
        expect(userReviews[1]).toHaveTextContent('2');
        expect(userReviews[2]).toHaveTextContent('3');
    });

    it('handles review correctly', () => {
        const singleReviewProps = {
        ...mockProps,
        numberOfReviews: 1,
        reviews: [{ id: '1', details: 'Single Review' }],
        };

        render(<ReviewList {...singleReviewProps} />);

        expect(screen.getByText('(1 review)')).toBeInTheDocument();
        expect(screen.getAllByTestId('user-review')).toHaveLength(1);
    });

    it('rounds average score correctly', () => {
        const roundingTestProps = {
        ...mockProps,
        averageScore: 3.3,
        };

        render(<ReviewList {...roundingTestProps} />);

        const filledStars = screen.getAllByTestId('filled-star');
        const halfStars = screen.getAllByTestId('half-star');
        const emptyStars = screen.getAllByTestId('empty-star');
        expect(filledStars).toHaveLength(3);
        expect(halfStars).toHaveLength(1);
        expect(emptyStars).toHaveLength(1);
    });
});