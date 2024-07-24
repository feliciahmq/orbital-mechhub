import React from 'react';
import { render, screen } from '@testing-library/react';
import ForumList from '../../../src/components/forumcards/ForumList';
import '@testing-library/jest-dom';

jest.mock('../../../src/components/forumcards/ForumCards', () => {
    return function MockForumCards({ forumDetail }) {
        return <div data-testid="forum-card">{forumDetail.title}</div>;
    };
});

describe('ForumList', () => {
    const mockForums = [
        { id: '1', title: 'Forum 1' },
        { id: '2', title: 'Forum 2' },
        { id: '3', title: 'Forum 3' },
    ];

    it('renders the heading correctly', () => {
        render(<ForumList heading="Test Heading" forums={mockForums} />);
        expect(screen.getByText('Test Heading')).toBeInTheDocument();
    });

    it('renders the correct number of ForumCards', () => {
        render(<ForumList heading="Test Heading" forums={mockForums} />);
        const forumCards = screen.getAllByTestId('forum-card');
        expect(forumCards).toHaveLength(3);
    });

    it('renders ForumCards correctly', () => {
        render(<ForumList heading="Test Heading" forums={mockForums} descriptionLength={150} />);
        expect(screen.getByText('Forum 1')).toBeInTheDocument();
        expect(screen.getByText('Forum 2')).toBeInTheDocument();
        expect(screen.getByText('Forum 3')).toBeInTheDocument();
    });
});