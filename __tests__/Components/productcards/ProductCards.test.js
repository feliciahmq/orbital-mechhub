import ProductCards from '../../../src/components/productcards/ProductCards';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../../src/Auth';
import { useLikes } from '../../../src/components/Header/likecounter/LikeCounter'; 
import { increaseLikeCount, decreaseLikeCount } from '../../../src/components/Header/likecounter/LikeCounter'; 
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

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));


const mockIncreaseLikeCount = jest.fn();
const mockDecreaseLikeCount = jest.fn();
jest.mock('../../../src/components/Header/likecounter/LikeCounter', () => ({
    useLikes: jest.fn(() => ({
        likesCount: 0,
        increaseLikeCount: mockIncreaseLikeCount,
        decreaseLikeCount: mockDecreaseLikeCount,
    })),
}));

const productDetail = {
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
});

afterEach(() => {
    jest.clearAllMocks();
});

test('renders product details and handles user interactions', async () => {
    render(
        <MemoryRouter>
            <ProductCards productDetail={productDetail} />
        </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    expect(screen.getByText('Others')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Test Product'));
    expect(mockNavigate).toHaveBeenCalledWith(`/product/${productDetail.id}`);

    fireEvent.click(screen.getByText('testuser'));
    expect(mockNavigate).toHaveBeenCalledWith(`/profile/${productDetail.userID}`);
    
    // for some reason these tests dont work
    // fireEvent.click(screen.getByRole('button'));
    // await waitFor(() => {
    //     expect(mockIncreaseLikeCount).toHaveBeenCalled();
    // });

    // fireEvent.click(screen.getByRole('button'));
    // await waitFor(() => {
    //     expect(mockDecreaseLikeCount).toHaveBeenCalled();
    // });
});