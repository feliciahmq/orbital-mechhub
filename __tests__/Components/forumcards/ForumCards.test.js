import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import ForumCards from '../../../src/components/forumcards/ForumCards';
import { useAuth } from '../../../src/Auth';
import * as firestore from 'firebase/firestore';
import { db } from '../../../src/lib/firebaseConfig';

jest.mock('../../../src/Auth', () => ({
    useAuth: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    updateDoc: jest.fn(),
    setDoc: jest.fn(),
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    deleteDoc: jest.fn(),
    }));

jest.mock('../../../src/lib/firebaseConfig', () => ({
    db: {},
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

describe('ForumCards', () => {
    const mockForumDetail = {
        id: '1',
        userID: 'user1',
        title: 'Test Forum',
        description: 'This is a test forum post',
        tags: ['Questions', 'Modding'],
        postDate: new Date().toISOString(),
        likeCount: 5,
        poll: { question: '', options: [] },
        media: [],
    };

    const mockUser = {
        uid: 'user1',
        username: 'testuser',
        profilePic: 'https://example.com/pic.jpg',
    };

    beforeEach(() => {
        useAuth.mockReturnValue({ currentUser: null });
        firestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUser,
        });
        firestore.getDocs.mockResolvedValue({ empty: true, docs: [] });
    });

    it('renders forum card correctly', async () => {
        await act(async () => {
        render(
            <MemoryRouter>
            <ForumCards forumDetail={mockForumDetail} />
            </MemoryRouter>
        );
        });

        expect(screen.getByText('Test Forum')).toBeInTheDocument();
        expect(screen.getByText('This is a test forum post')).toBeInTheDocument();
        expect(screen.getByText('Questions')).toBeInTheDocument();
        expect(screen.getByText('Modding')).toBeInTheDocument();
        expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('handles like only if user is logged in', async () => {
        useAuth.mockReturnValue({ currentUser: { uid: 'user2' } });
        firestore.addDoc.mockResolvedValue({});

        await act(async () => {
        render(
            <MemoryRouter>
            <ForumCards forumDetail={mockForumDetail} />
            </MemoryRouter>
        );
        });

        const likeButton = screen.getByTestId('like-button');
        await act(async () => {
        fireEvent.click(likeButton);
        });

        expect(firestore.addDoc).toHaveBeenCalled();
        expect(screen.getByText('6')).toBeInTheDocument(); 
    });

    it('displays poll', async () => {
        const forumWithPoll = {
        ...mockForumDetail,
        poll: {
            question: 'Test Poll',
            options: ['Option 1', 'Option 2'],
            votes: {},
        },
        };

        await act(async () => {
        render(
            <MemoryRouter>
            <ForumCards forumDetail={forumWithPoll} />
            </MemoryRouter>
        );
        });

        expect(screen.getByText('Test Poll')).toBeInTheDocument();
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
});