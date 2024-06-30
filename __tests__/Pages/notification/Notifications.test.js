import NotificationsPage from "../../../src/pages/notificaiton/Notificaitons";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { useAuth } from '../../../src/Auth';
import { MemoryRouter } from "react-router-dom";
import { collection, query, where, getDocs, updateDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';

jest.mock('../../../src/Auth', () => ({
    useAuth: jest.fn()
}));
jest.mock('../../../src/components/header/likecounter/LikeCounter', () => ({
    useLikes: jest.fn().mockReturnValue({ likeCount: 2 }),
}));

const mockSenderData = { uid: 'sender1', username: 'Sender One' };
const mockListingData = { title: 'Listing One' };

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    updateDoc: jest.fn(),
    doc: jest.fn((...args) => ({ id: args[1] })),
    getDoc: jest.fn((docRef) => {
        if (docRef.id === 'sender1') {
            return Promise.resolve({
                exists: () => true,
                data: () => mockSenderData,
            });
        }
        if (docRef.id === 'listing1') {
            return Promise.resolve({
                exists: () => true,
                data: () => mockListingData,
            });
        }
        return Promise.resolve({ exists: () => false });
    }),
    deleteDoc: jest.fn(),
}));

jest.mock('../../../src/lib/firebaseConfig', () => ({
    db: {}
}));

describe('NotificationsPage', () => {
    const mockCurrentUser = { uid: 'testUser' };
    const mockNotifications = [
        {
            id: 'notif1',
            recipientID: 'testUser',
            senderID: 'sender1',
            type: 'like',
            listingID: 'listing1',
            read: false,
            timestamp: { toDate: () => new Date(Date.now() - 60000) }
        }
    ];

    beforeEach(() => {
        useAuth.mockReturnValue({ currentUser: mockCurrentUser });
        getDocs.mockResolvedValue({ 
            docs: mockNotifications.map(notification => ({
                id: notification.id,
                data: () => notification
            }))
        });
    });

    it('fetches and displays notifications', async () => {
        render(
            <MemoryRouter>
                <NotificationsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Your Notifications')).toBeInTheDocument();
        });

        const notificationItem = await screen.findByTestId('notification-item');
        expect(notificationItem).toBeInTheDocument();
        expect(notificationItem).toHaveTextContent('liked your post');
    });

    it('marks notifications as read', async () => {
        render(
            <MemoryRouter>
                <NotificationsPage />
            </MemoryRouter>
        );

        const notificationItem = await screen.findByTestId('notification-item');
        expect(notificationItem).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Mark as read/i}));
        
        await waitFor(() => {
            expect(screen.getByText("You have no notifications at the moment ( ˘･з･)")).toBeInTheDocument();
        });
    });
});