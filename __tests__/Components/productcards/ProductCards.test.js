import ProductCards from '../../../src/components/productcards/ProductCards';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../../src/Auth';
import { useLikes } from '../../../src/components/header/likecounter/LikeCounter'; 
import { db } from '../../../src/lib/firebaseConfig';
import { doc, getDoc, addDoc, deleteDoc, updateDoc, getDocs, collection } from 'firebase/firestore';
import '@testing-library/jest-dom';

jest.mock('../../../src/Auth');
jest.mock('../../../src/components/header/likecounter/LikeCounter');
jest.mock('firebase/firestore', () => {
    return {
        ...jest.requireActual('firebase/firestore'),
        doc: jest.fn(),
        getDoc: jest.fn(),
        setDoc: jest.fn(),
        updateDoc: jest.fn(),
        deleteDoc: jest.fn(),
        addDoc: jest.fn(),
        collection: jest.fn(),
        query: jest.fn(),
        where: jest.fn(),
        getDocs: jest.fn(),
    };
});
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const mockNavigate = jest.fn();

const mockUseLikes = require('../../../src/components/header/likecounter/LikeCounter').useLikes;

const mockListing = {
    id: 'product-id',
    title: 'Test Product',
    productType: 'Test Type',
    price: 100,
    image: 'test-image-url',
    userID: 'user-id',
};

const userDetail = {
    username: 'testuser',
    profilePic: 'test-profile-pic-url',
    status: 'active',
};

beforeEach(() => {
    useAuth.mockReturnValue({
        currentUser: { uid: 'current-user-id' },
    });

    doc.mockImplementation((_, collection, id) => ({ id }));
    getDoc.mockImplementation((ref) => {
        if (ref.id === 'user-id') {
            return Promise.resolve({ exists: () => true, data: () => userDetail });
        } else if (ref.id === 'counter') {
            return Promise.resolve({ exists: () => false });
        }
        return Promise.resolve({ exists: () => false });
    });

    addDoc.mockResolvedValue({ id: 'like-id' });
    deleteDoc.mockResolvedValue();
    updateDoc.mockResolvedValue();

    getDocs.mockResolvedValue({
        empty: false,
        docs: [{ id: 'like-id' }]
    });

    mockUseLikes.mockReturnValue({
        likesCount: 0,
        increaseLikeCount: jest.fn(),
        decreaseLikeCount: jest.fn(),
    });
});

afterEach(() => {
    jest.clearAllMocks();
});

test('renders users information', async () => {
    render(
        <MemoryRouter>
            <ProductCards productDetail={mockListing} />
        </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    expect(screen.getByText('Others')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
});

test('navigates to listers profile when user information is clicked', async () => {
    render(
        <MemoryRouter>
            <ProductCards productDetail={mockListing} />
        </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('testuser'));
    expect(mockNavigate).toHaveBeenCalledWith(`/profile/${mockListing.userID}`);
});
    
test('renders users information', async () => {
    render(
        <MemoryRouter>
            <ProductCards productDetail={mockListing} />
        </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    expect(screen.getByText('Others')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
});

test('navigates to listing information when card is clicked', async () => {
    render(
        <MemoryRouter>
            <ProductCards productDetail={mockListing} />
        </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Product'));
    expect(mockNavigate).toHaveBeenCalledWith(`/product/${mockListing.id}`);
});
    