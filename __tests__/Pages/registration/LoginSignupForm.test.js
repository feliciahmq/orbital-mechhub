import React from 'react';
import '@testing-library/jest-dom';
import LoginSignUpForm from '../../../src/pages/registration/LoginSignupForm';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../src/Auth';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getDocs, setDoc } from 'firebase/firestore';
import { auth } from '../../../src/lib/firebaseConfig';
import toast from 'react-hot-toast';

jest.mock('../../../src/Auth');
jest.mock( '../../../src/components/Header/likecounter/LikeCounter', () => ({
    useLikes: jest.fn(() => ({ likeCount: 50 }))
}));
jest.mock('firebase/auth');
jest.mock('firebase/firestore')
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));
jest.mock('react-hot-toast');

describe('LoginSignUpForm', () => {
    const mockNavigate = jest.fn();
    
    beforeEach(() => {
        useAuth.mockReturnValue({
            currentUser: { uid: 'test-user' }
        });
    
        getDocs.mockResolvedValue({
            empty: true,
            docs: [],
        });

        toast.success = jest.fn();
        toast.error = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);
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

    test('handles signup correctly', async () => {
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
            expect(setDoc).toHaveBeenCalledTimes(2); // Users and UserChats
            expect(toast.success).toHaveBeenCalledWith("Account created successfully.");
            expect(mockNavigate).toHaveBeenCalledWith(`/profile/tester-uid`);
        });
    });  

    test('handles login correctly', async () => {
        signInWithEmailAndPassword.mockResolvedValue({
            user: { uid: 'tester-uid', email: 'tester@eg.com'},
        })
        setDoc.mockResolvedValue();

        render(
            <MemoryRouter>
              <LoginSignUpForm />
            </MemoryRouter>
        );

        // Input login form
        fireEvent.change(screen.getByTestId("login-email"), 
            { target: { value: 'tester@eg.com' } });
        fireEvent.change(screen.getByTestId("login-password"), 
            { target: { value: 'password123' } });

        // Submit login form
        fireEvent.submit(screen.getByTestId("login-submit"));

        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
                auth, 'tester@eg.com', 'password123'
            );
            expect(toast.success).toHaveBeenCalledWith("Login successfully.");
            expect(mockNavigate).toHaveBeenCalledWith(`/profile/tester-uid`);
        });
    }); 

    test('renders signup email in use error notifications', async () => {
        createUserWithEmailAndPassword.mockRejectedValue({
            code: "auth/email-already-in-use",
        });

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
            expect(toast.error).toHaveBeenCalledWith("The email address is already in use.");
        });
    });

    test('renders signup email error notifications', async () => {
        createUserWithEmailAndPassword.mockRejectedValue({
            code: "auth/invalid-email",
        });

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
            expect(toast.error).toHaveBeenCalledWith("Invalid email address.");
        });
    });

    test('renders signup weak password error notifications', async () => {
        createUserWithEmailAndPassword.mockRejectedValue({
            code: "auth/weak-password",
        });

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
            expect(toast.error).toHaveBeenCalledWith("Password must be at least six characters.");
        });
    });

    test('renders empty fields error notifications', async () => {
        render(
            <MemoryRouter>
              <LoginSignUpForm />
            </MemoryRouter>
        );

        // Login form
        fireEvent.submit(screen.getByTestId("login-submit"));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("All fields are required.")
        });

        // Signup form
        fireEvent.click(screen.getByTestId("sign-up-toggle"));
        fireEvent.submit(screen.getByTestId("sign-up-submit"));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("All fields are required.")
        });
        
    });

    test('renders login error notifications', async () => {
        signInWithEmailAndPassword.mockRejectedValue({
            code: "auth/invalid-credential"
        })

        render(
            <MemoryRouter>
              <LoginSignUpForm />
            </MemoryRouter>
        );

        // Input login form
        fireEvent.change(screen.getByTestId("login-email"), 
            { target: { value: 'tester@eg.com' } });
        fireEvent.change(screen.getByTestId("login-password"), 
            { target: { value: 'password123' } });

        // Submit login form
        fireEvent.submit(screen.getByTestId("login-submit"));

        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
                auth, 'tester@eg.com', 'password123'
            );
            expect(toast.error).toHaveBeenCalledWith("You have entered an invalid username or password.");
        });
    });

});