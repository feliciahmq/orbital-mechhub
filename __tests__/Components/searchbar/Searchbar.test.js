import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchBar from '../../../src/components/searchbar/SearchBar';
import { useAuth } from '../../../src/Auth';
import { db } from '../../../src/lib/firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import '@testing-library/jest-dom';

jest.mock('../../../src/Auth');
jest.mock('../../../src/lib/firebaseConfig');
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    addDoc: jest.fn(),
    collection: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

const mockUseNavigate = require('react-router-dom').useNavigate;

describe('SearchBar', () => {
    beforeEach(() => {
        useAuth.mockReturnValue({
            currentUser: { uid: 'test-user' },
        });
        addDoc.mockResolvedValue({});
        mockUseNavigate.mockReturnValue(jest.fn());
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders search input and button', () => {
        const { getByPlaceholderText, getByRole } = render(
            <MemoryRouter>
                <SearchBar />
            </MemoryRouter>
        );

        expect(getByPlaceholderText('Search Products')).toBeInTheDocument();
        expect(getByRole('button')).toBeInTheDocument();
    });

    test('updates input value on change', () => {
        const { getByPlaceholderText } = render(
            <MemoryRouter>
                <SearchBar />
            </MemoryRouter>
        );

        const input = getByPlaceholderText('Search Products');
        fireEvent.change(input, { target: { value: 'Test Query' } });

        expect(input.value).toBe('Test Query');
    });

    test('calls trackSearchHistory and navigates on form submit', async () => {
        const navigate = jest.fn();
        mockUseNavigate.mockReturnValue(navigate);

        const { getByPlaceholderText, getByRole } = render(
            <MemoryRouter>
                <SearchBar />
            </MemoryRouter>
        );

        const input = getByPlaceholderText('Search Products');
        fireEvent.change(input, { target: { value: 'Test Query' } });

        fireEvent.submit(getByRole('button'));

        await waitFor(() => {
            expect(addDoc).toHaveBeenCalledWith(collection(db, 'userHistory', 'test-user', 'searchHistory'), {
                query: 'Test Query',
                timestamp: expect.any(String),
            });
            expect(navigate).toHaveBeenCalledWith('/search?query=Test Query');
        });
    });

    test('does not track search history if no currentUser', async () => {
        useAuth.mockReturnValue({
            currentUser: null,
        });

        const { getByPlaceholderText, getByRole } = render(
            <MemoryRouter>
                <SearchBar />
            </MemoryRouter>
        );

        const input = getByPlaceholderText('Search Products');
        fireEvent.change(input, { target: { value: 'Test Query' } });

        fireEvent.submit(getByRole('button'));

        await waitFor(() => {
            expect(addDoc).not.toHaveBeenCalled();
        });
    });
});