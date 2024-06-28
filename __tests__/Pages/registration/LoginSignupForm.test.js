import React from 'react';
import '@testing-library/jest-dom';
import LoginSignupForm from '../../../src/pages/registration/LoginSignupForm';

import { render, screen, within, fireEvent,waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../src/Auth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from 'firebase/firestore';
import defaultProfile from '../../assets/defaultProfile.jpg';
import { auth, db } from '../../../src/lib/firebaseConfig';
import toast from 'react-hot-toast';

jest.mock('../../../src/Auth');
jest.mock( '../../../src/components/Header/likecounter/LikeCounter', () => ({
    useLikes: jest.fn(() => ({ likeCount: 50 }))
}));
jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('react-hot-toast');


describe('LoginSignupForm', () => {
    const navigate = jest.fn();

    beforeEach(() => {
        useAuth.mockReturnValue({
            currentUser: { uid: 'tester' }
        });
        useNavigate.mockReturnValue(navigate);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders login and signup form', async () => {
        render(
            <MemoryRouter>
                <LoginSignupForm />
            </MemoryRouter>
        );
        
        // Login form
        const loginLabel = screen.getByText(/Login/i);
        expect(loginLabel).toBeInTheDocument();
        const loginForm = loginLabel.closest("form");
        expect(within(loginForm).getByPlaceholderText("Email")).toBeInTheDocument();
        expect(within(loginForm).getByPlaceholderText("Password")).toBeInTheDocument();
        
        // Toggle to signup form
        fireEvent.click(screen.getByRole("button", {name: /Sign up/i}));
        const signupLabel = screen.getByText("Create Account");
        expect(signupLabel).toBeInTheDocument();
        const signupForm = signupLabel.closest("form");
        expect(within(signupForm).getByPlaceholderText("Username")).toBeInTheDocument();
        expect(within(signupForm).getByPlaceholderText("Email")).toBeInTheDocument();
        expect(within(signupForm).getByPlaceholderText("Password")).toBeInTheDocument();

        // Toggle to login form
        fireEvent.click(screen.getByRole("button", {name: /Log in/i}));
        expect(loginLabel).toBeInTheDocument();
        
    });

    test('renders input changes', async () => {
        render(
            <MemoryRouter>
                <LoginSignupForm />
            </MemoryRouter>
        );

        // Login Form input changes
        const loginLabel = screen.getByText(/Login/i);
        const loginForm = loginLabel.closest("form");
        const emailInput = within(loginForm).getByPlaceholderText("Email");
        const passwordInput = within(loginForm).getByPlaceholderText("Password");

        fireEvent.change(emailInput, {target: {value: "tester@eg.com"}});
        fireEvent.change(passwordInput, {target: {value: "password123"}});

        expect(emailInput.value).toBe("tester@eg.com");
        expect(passwordInput.value).toBe("password123");

        // Toggle, Signup Form input changes
        fireEvent.click(screen.getByRole("button", {name: /Sign up/i}));
        const signupLabel = screen.getByText("Create Account");
        const signupForm = signupLabel.closest("form");
        const suUsername = within(signupForm).getByPlaceholderText("Username");
        const suEmailInput = within(signupForm).getByPlaceholderText("Email");
        const suPasswordInput = within(signupForm).getByPlaceholderText("Password");

        fireEvent.change(suUsername, {target: {value: "tester"}});
        fireEvent.change(suEmailInput, {target: {value: "tester@eg.com"}});
        fireEvent.change(suPasswordInput, {target: {value: "password123"}});

        expect(suUsername.value).toBe("tester");
        expect(emailInput.value).toBe("tester@eg.com");
        expect(passwordInput.value).toBe("password123");

    }); 

    test('handles signup correctly', async () => {
        createUserWithEmailAndPassword.mockResolvedValue({
            user: { uid: 'tester-uid', email: 'tester@eg.com'},
        });
        setDoc.mockResolvedValue();

        render(
            <MemoryRouter>
                <LoginSignupForm />
            </MemoryRouter>
        );

        // Toggle to signup form
        fireEvent.click(screen.getByRole("button", {name: /Sign up/i}));

        // Input signup form
        fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'tester' } });
        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'tester@eg.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

        // Submit signup form
        fireEvent.submit(screen.getByRole("button", { name: /Sign up/i}));

        await waitFor(() => {
            expect(createUserWithEmailAndPassword).toHaveBeenCalled(auth,'tester@eg.com', 'password123');
            expect(setDoc).toHaveBeenCalled(
                doc(db, "Users", 'tester-uid'), {
                    username: 'tester',
                    email: 'tester@eg.com',
                    id: 'tester-uid',
                    profilePic: defaultProfile,
                    blocked: [],
                    signUpDate: expect.any(String),
                }
            );
            expect(toast.success).toHaveBeenCalled("Account created successfully.");
            expect(navigate).toHaveBeenCalled(`/profile/tester-uid`);
        });

    }); 

    test('handles login correctly', async () => {
        signInWithEmailAndPassword.mockResolvedValue({
            user: { uid: 'tester-uid', email: 'tester@eg.com'},
        });

        render(
            <MemoryRouter>
                <LoginSignupForm />
            </MemoryRouter>
        );

        // Input login form
        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'tester@eg.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

        screen.debug();
        
        // Submit login form
        fireEvent.submit(screen.getByRole("submit", { name: /Log in/i}));

        await waitFor(() => {
            expect(createUserWithEmailAndPassword).toHaveBeenCalled(auth,'tester@eg.com', 'password123');
            expect(toast.success).toHaveBeenCalled("Login successfully.");
            expect(navigate).toHaveBeenCalled(`/profile/tester-uid`);
        });

    }); 

    test('renders correct error notifications', async () => {
        render(
            <MemoryRouter>
                <LoginSignupForm />
            </MemoryRouter>
        );


    }) 

});
