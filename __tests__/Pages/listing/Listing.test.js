import ListingPage from '../../../src/pages/listing/Listing';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from '../../../src/Auth';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useLikes } from '../../../src/components/header/likecounter/LikeCounter'; 
import { collection, addDoc, doc, docs, getDoc, updateDoc, getDocs, query } from 'firebase/firestore';

jest.mock('../../../src/Auth');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
    useParams: jest.fn()
}));
jest.mock('react-hot-toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn()
    }
}));
jest.mock('firebase/firestore', () => {
    const originalModule = jest.requireActual('firebase/firestore');
    return {
        ...originalModule,
        collection: jest.fn(),
        addDoc: jest.fn(),
        doc: jest.fn(),
        getDoc: jest.fn(),
        updateDoc: jest.fn(),
        getDocs: jest.fn(),
        query: jest.fn()
    };
});
jest.mock( '../../../src/components/Header/likecounter/LikeCounter', () => ({
    useLikes: jest.fn(() => ({ likeCount: 50 }))
}));

const mockUser = { uid: '123', username: 'testUser' };

const mockNavigate = jest.fn();

beforeEach(() => {
    useAuth.mockReturnValue({ currentUser: mockUser });
    useNavigate.mockReturnValue(mockNavigate);
    useParams.mockReturnValue({ listingID: null });
    toast.error = jest.fn();
    toast.success = jest.fn();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('ListingPage', () => {

    const getFormControlByLabel = (labelText) => {
        return screen.getByLabelText(labelText, { 
            selector: 'input, textarea, select' 
        });
    };

    test('renders the create listing form', () => {
        render(
            <Router>
                <ListingPage />
            </Router>
        );

        expect(screen.getByText('Create Listing')).toBeInTheDocument();
        expect(getFormControlByLabel('Title:')).toBeInTheDocument();
        expect(getFormControlByLabel('Price:')).toBeInTheDocument();
        expect(getFormControlByLabel('Description:')).toBeInTheDocument();
        expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    test('submits the form successfully for new listing', async () => {
        addDoc.mockResolvedValue({ id: 'newListingID' });
        getDoc.mockResolvedValue({ exists: () => true, data: () => mockUser });
        getDocs.mockResolvedValue({ docs: [] });

        render(
            <Router>
                <ListingPage />
            </Router>
        );
        fireEvent.change(getFormControlByLabel('Title:'), {
            target: { value: 'Test Title' }
        });
        fireEvent.change(getFormControlByLabel('Price:'), {
            target: { value: '100' }
        });
        fireEvent.change(getFormControlByLabel('Description:'), {
            target: { value: 'Test Description' }
        });

        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(addDoc).toHaveBeenCalledTimes(1);
            expect(toast.success).toHaveBeenCalledWith('Listing Successfully Created!');
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    test('handles form submission error', async () => {
        addDoc.mockRejectedValue(new Error('Submission failed'));

        render(
            <Router>
                <ListingPage />
            </Router>
        );

        fireEvent.change(screen.getByLabelText('Title:'), {
            target: { value: 'Test Title' }
        });
        fireEvent.change(screen.getByLabelText('Price:'), {
            target: { value: '100' }
        });
        fireEvent.change(screen.getByLabelText('Description:'), {
            target: { value: 'Test Description' }
        });

        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(addDoc).toHaveBeenCalledTimes(1);
            expect(toast.error).toHaveBeenCalledWith('Submission failed');
        });
    });
});

describe('ListingPage (edit mode)', () => {
    const getFormControlByLabel = (labelText) => {
        return screen.getByLabelText(labelText, { 
            selector: 'input, textarea, select' 
        });
    };
    
    beforeEach(() => {
        useParams.mockReturnValue({ listingID: 'existingListingID' });
    });

    test('renders the edit listing form and fetches listing data', async () => {
        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({
                title: 'Existing Title',
                image: 'existingImage.jpg',
                productType: 'keycaps',
                price: '150',
                description: 'Existing Description',
                postDate: '2023-01-01',
                status: 'available'
            })
        });

        render(
            <Router>
                <ListingPage />
            </Router>
        );

        await waitFor(() => {
            expect(getFormControlByLabel('Title:').value).toBe('Existing Title');
            expect(getFormControlByLabel('Price:').value).toBe('150');
            expect(getFormControlByLabel('Description:').value).toBe('Existing Description');
            expect(screen.getByText('Update')).toBeInTheDocument();
        });
    });

    test('updates the listing successfully', async () => {
        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({
                title: 'Existing Title',
                image: 'existingImage.jpg',
                productType: 'keycaps',
                price: '150',
                description: 'Existing Description',
                postDate: '2023-01-01',
                status: 'available'
            })
        });
        updateDoc.mockResolvedValue();

        render(
            <Router>
                <ListingPage />
            </Router>
        );

        await waitFor(() => {
            fireEvent.change(screen.getByLabelText('Title:'), {
                target: { value: 'Updated Title' }
            });
            fireEvent.change(screen.getByLabelText('Price:'), {
                target: { value: '200' }
            });
            fireEvent.change(screen.getByLabelText('Description:'), {
                target: { value: 'Updated Description' }
            });
        });

        fireEvent.click(screen.getByText('Update'));

        await waitFor(() => {
            expect(updateDoc).toHaveBeenCalledTimes(1);
            expect(toast.success).toHaveBeenCalledWith('Listing Successfully Updated!');
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });
});