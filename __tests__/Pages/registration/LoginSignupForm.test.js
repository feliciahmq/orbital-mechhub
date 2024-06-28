import React from 'react';
import '@testing-library/jest-dom';
import LoginSignUpForm from '../../../src/pages/registration/LoginSignupForm';

import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../../src/Auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getDocs, setDoc } from 'firebase/firestore';
import { auth } from '../../../src/lib/firebaseConfig';
import toast from 'react-hot-toast';

jest.mock('../../../src/Auth');
jest.mock( '../../../src/components/Header/likecounter/LikeCounter', () => ({
    useLikes: jest.fn(() => ({ likeCount: 50 }))
}));
jest.mock('firebase/auth');
jest.mock('firebase/firestore')

describe('LoginSignUpForm', () => {
    beforeEach(() => {
        useAuth.mockReturnValue({
            currentUser: { uid: 'test-user' }
        });
    
        getDocs.mockResolvedValue({
            empty: true,
            docs: []
        });

        setDoc.mockResolvedValue();
        toast.success = jest.fn();
        toast.error = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders login and signup form', async () => {
        render(
        <MemoryRouter>
            <LoginSignUpForm />
        </MemoryRouter>
        );
        
        const loginLabel = screen.getByText("Login");
        expect(screen.getByTestId("login-email")).toBeInTheDocument();
        expect(screen.getByTestId("login-password")).toBeInTheDocument();
        
        fireEvent.click(screen.getByTestId("sign-up-toggle"));
        const signupLabel = screen.getByText("Create Account");
        expect(screen.getByTestId("signup-username")).toBeInTheDocument();
        expect(screen.getByTestId("signup-email")).toBeInTheDocument();
        expect(screen.getByTestId("signup-password")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("login-toggle"));
        expect(loginLabel).toBeInTheDocument();
    });

    test('renders input changes', async () => {
        render(
            <MemoryRouter>
              <LoginSignUpForm />
            </MemoryRouter>
        );

        const emailInput = screen.getByTestId("login-email");
        const passwordInput = screen.getByTestId("login-password");

        fireEvent.change(emailInput, {target: {value: "test@eg.com"}});
        fireEvent.change(passwordInput, {target: {value: "password123"}});

        expect(emailInput.value).toBe("test@eg.com");
        expect(passwordInput.value).toBe("password123");

        fireEvent.click(screen.getByTestId("sign-up-toggle"));

        const suUsername = screen.getByTestId("signup-username");
        const suEmailInput = screen.getByTestId("signup-email");
        const suPasswordInput = screen.getByTestId("signup-password");

        fireEvent.change(suUsername, {target: {value: "tester"}});
        fireEvent.change(suEmailInput, {target: {value: "test@eg.com"}});
        fireEvent.change(suPasswordInput, {target: {value: "password123"}});

        expect(suUsername.value).toBe("tester");
        expect(emailInput.value).toBe("test@eg.com");
        expect(passwordInput.value).toBe("password123");
    }); 

    test('renders signup correctly', async () => {
        createUserWithEmailAndPassword.mockResolvedValue({
            user: { uid: 'tester-uid', email: 'tester@eg.com'},
        })
        setDoc.mockResolvedValue();

        render(
            <MemoryRouter>
              <LoginSignUpForm />
            </MemoryRouter>
        );

        // Toggle to signup form
        fireEvent.click(screen.getByTestId("sign-up-toggle"));

        // Input signup form
        fireEvent.change(screen.getByTestId("signup-username"), 
            { target: { value: 'tester' } });
        fireEvent.change(screen.getByTestId("signup-email"), 
            { target: { value: 'tester@eg.com' } });
        fireEvent.change(screen.getByTestId("signup-password"), 
            { target: { value: 'password123' } });

        // Submit signup form
        fireEvent.submit(screen.getByTestId("sign-up-submit"));

        await waitFor(() => {
            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
                auth, 'tester@eg.com', 'password123'
            );
            expect(setDoc).toHaveBeenCalledTimes(2);
            expect(toast.success).toHaveBeenCalledWith("Account created successfully.");
        });
    }); 

    test('handles login correctly', async () => {
        render(
            <MemoryRouter>
              <LoginSignUpForm />
            </MemoryRouter>
        );
    }) 

    test('renders correct error notifications', async () => {
        render(
            <MemoryRouter>
              <LoginSignUpForm />
            </MemoryRouter>
        );
    }) 

});