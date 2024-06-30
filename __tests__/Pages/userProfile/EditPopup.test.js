import EditPopup from '../../../src/pages/userprofile/editUser/EditPopup';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { auth, db, storage } from "../../../src/lib/firebaseConfig";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from 'react-hot-toast';
import '@testing-library/jest-dom';

jest.mock('../../../src/lib/firebaseConfig', () => ({
    auth: { currentUser: { uid: 'testuid' }, onAuthStateChanged: jest.fn() },
    db: {},
    storage: {},
}));
jest.mock('firebase/firestore');
jest.mock('firebase/storage');
jest.mock('react-hot-toast');

describe('EditPopup', () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();

    const getFormControlByLabel = (labelText) => {
        return screen.getByLabelText(labelText, { 
            selector: 'input, textarea, select' 
        });
    };

    beforeEach(() => {
        auth.onAuthStateChanged.mockImplementation((callback) => callback({ uid: 'testuid' }));

        getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
            profilePic: 'test.jpg',
            username: 'testuser',
            email: 'test@example.com'
        })
        });
    });

    test('renders EditPopup and loads user data', async () => {
        await act(async () => {
            render(<EditPopup onClose={mockOnClose} onSubmit={mockOnSubmit} />);
        });

        await waitFor(() => {
            expect(getFormControlByLabel('Username:')).toHaveValue('testuser');
            expect(getFormControlByLabel('Email:')).toHaveValue('test@example.com');
        });
    });

    test('updates form data when user types', async () => {
        await act(async () => {
            render(<EditPopup onClose={mockOnClose} onSubmit={mockOnSubmit} />);
        });

        await act(async () => {
            const usernameInput = getFormControlByLabel('Username:');
            fireEvent.change(usernameInput, { target: { value: 'newusername' } });
        });

        expect(getFormControlByLabel('Username:')).toHaveValue('newusername');
    });

    test('calls onClose when close button is clicked', () => {
        render(<EditPopup onClose={mockOnClose} onSubmit={mockOnSubmit} />);

        fireEvent.click(screen.getByText('X'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('submits form and updates profile', async () => {
        updateDoc.mockResolvedValue();
        getDocs.mockResolvedValue({ forEach: jest.fn() });
        writeBatch.mockReturnValue({ commit: jest.fn(), update: jest.fn() });

        await act(async () => {
            render(<EditPopup onClose={mockOnClose} onSubmit={mockOnSubmit} />);
        });

        await act(async () => {
            fireEvent.change(getFormControlByLabel('Username:'), { target: { value: 'newusername' } });
            fireEvent.change(getFormControlByLabel('Email:'), { target: { value: 'newemail@example.com' } });
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Submit'));
        });

        expect(updateDoc).toHaveBeenCalled();
        expect(mockOnSubmit).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Profile Updated!');
    });

    test('handles image upload', async () => {
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        
        const mockFileReader = {
            readAsDataURL: jest.fn(),
            result: 'data:image/png;base64,ZHVtbXlkYXRh',
            onload: jest.fn()
        };
        window.FileReader = jest.fn(() => mockFileReader);

        await act(async () => {
            render(<EditPopup onClose={mockOnClose} onSubmit={mockOnSubmit} />);
        });

        await act(async () => {
            const input = getFormControlByLabel('Profile Picture');
            fireEvent.change(input, { target: { files: [file] } });
        });

        expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);
        mockFileReader.onload({ target: mockFileReader });

        await waitFor(() => {
            expect(getFormControlByLabel('Profile Picture')).toHaveValue('');
        });
    });

    test('shows error toast for non-image file', async () => {
        const file = new File(['(⌐□_□)'], 'chucknorris.txt', { type: 'text/plain' });

        render(<EditPopup onClose={mockOnClose} onSubmit={mockOnSubmit} />);

        const input = screen.getByLabelText('Profile Picture');
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Only Images Allowed');
        });
    });
});