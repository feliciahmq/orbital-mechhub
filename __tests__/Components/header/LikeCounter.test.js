import React from 'react';
import { render, act } from '@testing-library/react';
import { useLikes, LikeCountProvider } from '../../../src/components/Header/likecounter/LikeCounter';
import { useAuth } from '../../../src/Auth';
import { db } from '../../../src/lib/firebaseConfig';
import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';

jest.mock('../../../src/Auth');
jest.mock('../../../src/lib/firebaseConfig', () => ({
    db: {},
}));
jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    onSnapshot: jest.fn((docRef, callback) => {
        const unsubscribe = jest.fn();
        callback({
            exists: () => true,
            data: () => ({ count: 5 }),
            docChanges: () => [{
                type: 'removed',
                doc: {
                    id: 'test-id',
                    data: () => ('')
                }
            }]
        });
        return unsubscribe;
    }),
    collection: jest.fn(),
}));

const mockUseAuth = useAuth;

const TestComponent = () => {
    const { likeCount, increaseLikeCount, decreaseLikeCount } = useLikes();
    return (
        <div>
            <span data-testid="like-count">{likeCount}</span>
            <button onClick={increaseLikeCount}>Increase</button>
            <button onClick={decreaseLikeCount}>Decrease</button>
        </div>
    );
};

describe('LikeCountProvider', () => {
    beforeEach(() => {
        mockUseAuth.mockReturnValue({ currentUser: { uid: '123' } });
        doc.mockReturnValue({});
        getDoc.mockResolvedValue({ exists: () => true, data: () => ({ count: 5 }) });
        setDoc.mockResolvedValue();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('fetches and sets initial like count from Firestore', async () => {
        let getByTestId;
        await act(async () => {
            const { getByTestId: localGetByTestId } = render(
                <LikeCountProvider>
                    <TestComponent />
                </LikeCountProvider>
            );
            getByTestId = localGetByTestId;
        });

        expect(getDoc).toHaveBeenCalledWith(doc(db, 'Users', '123', 'likeCount', 'counter'));
        expect(getByTestId('like-count').textContent).toBe('5');
    });

    test('increases the like count and updates Firestore', async () => {
        let getByTestId, getByText;
        await act(async () => {
            const { getByTestId: localGetByTestId, getByText: localGetByText } = render(
                <LikeCountProvider>
                    <TestComponent />
                </LikeCountProvider>
            );
            getByTestId = localGetByTestId;
            getByText = localGetByText;
        });

        const increaseButton = getByText('Increase');
        await act(async () => {
            increaseButton.click();
        });

        expect(setDoc).toHaveBeenCalledWith(doc(db, 'Users', '123', 'likeCount', 'counter'), { count: 6 });
        expect(getByTestId('like-count').textContent).toBe('6');
    });

    test('decreases the like count and updates Firestore', async () => {
        let getByTestId, getByText;
        await act(async () => {
            const { getByTestId: localGetByTestId, getByText: localGetByText } = render(
                <LikeCountProvider>
                    <TestComponent />
                </LikeCountProvider>
            );
            getByTestId = localGetByTestId;
            getByText = localGetByText;
        });

        const decreaseButton = getByText('Decrease');
        await act(async () => {
            decreaseButton.click();
        });

        expect(setDoc).toHaveBeenCalledWith(doc(db, 'Users', '123', 'likeCount', 'counter'), { count: 4 });
        expect(getByTestId('like-count').textContent).toBe('4');
    });

    test('does not decrease the like count below 0', async () => {
        getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ count: 0 }) });

        let getByTestId, getByText;
        await act(async () => {
            const { getByTestId: localGetByTestId, getByText: localGetByText } = render(
                <LikeCountProvider>
                    <TestComponent />
                </LikeCountProvider>
            );
            getByTestId = localGetByTestId;
            getByText = localGetByText;
        });

        const decreaseButton = getByText('Decrease');
        await act(async () => {
            decreaseButton.click();
        });

        expect(setDoc).toHaveBeenCalledWith(doc(db, 'Users', '123', 'likeCount', 'counter'), { count: 0 });
        expect(getByTestId('like-count').textContent).toBe('0');
    });
});