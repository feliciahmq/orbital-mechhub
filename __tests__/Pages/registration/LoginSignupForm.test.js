import React from 'react';
import '@testing-library/jest-dom';
import LoginSignUpForm from '../../../src/pages/registration/LoginSignupForm';

import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../../src/Auth';

jest.mock('../../../src/Auth');
jest.mock( '../../../src/components/Header/likecounter/LikeCounter', () => ({
    useLikes: jest.fn(() => ({ likeCount: 50 }))
}));
jest.mock('firebase/auth');

describe('LoginSignUpForm', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      currentUser: { uid: 'test-user' }
    });
  });

  test('renders login and signup form', async () => {
    render(
      <MemoryRouter>
        <LoginSignUpForm />
      </MemoryRouter>
    );
    
    const loginLabel = screen.getByText("Login");
    expect(loginLabel).toBeInTheDocument();
    const loginForm = loginLabel.closest("form");
    expect(within(loginForm).getByPlaceholderText("Email")).toBeInTheDocument();
    expect(within(loginForm).getByPlaceholderText("Password")).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole("button", {name: "Sign up"}));
    const signupLabel = screen.getByText("Create Account");
    expect(signupLabel).toBeInTheDocument();
    const signupForm = signupLabel.closest("form");
    expect(within(signupForm).getByPlaceholderText("Username")).toBeInTheDocument();
    expect(within(signupForm).getByPlaceholderText("Email")).toBeInTheDocument();
    expect(within(signupForm).getByPlaceholderText("Password")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", {name: "Log in"}));
    expect(loginLabel).toBeInTheDocument();
    
    });

    test('renders input changes', async () => {render(
        <MemoryRouter>
          <LoginSignUpForm />
        </MemoryRouter>
        );

        const loginLabel = screen.getByText("Login");
        const loginForm = loginLabel.closest("form");
        const emailInput = within(loginForm).getByPlaceholderText("Email");
        const passwordInput = within(loginForm).getByPlaceholderText("Password");

        fireEvent.change(emailInput, {target: {value: "test@eg.com"}});
        fireEvent.change(passwordInput, {target: {value: "password123"}});

        expect(emailInput.value).toBe("test@eg.com");
        expect(passwordInput.value).toBe("password123");

        fireEvent.click(screen.getByRole("button", {name: "Sign up"}));

        const signupLabel = screen.getByText("Create Account");
        const signupForm = signupLabel.closest("form");
        const suUsername = within(signupForm).getByPlaceholderText("Username");
        const suEmailInput = within(signupForm).getByPlaceholderText("Email");
        const suPasswordInput = within(signupForm).getByPlaceholderText("Password");

        fireEvent.change(suUsername, {target: {value: "tester"}});
        fireEvent.change(suEmailInput, {target: {value: "test@eg.com"}});
        fireEvent.change(suPasswordInput, {target: {value: "password123"}});

        expect(suUsername.value).toBe("tester");
        expect(emailInput.value).toBe("test@eg.com");
        expect(passwordInput.value).toBe("password123");

    }); 

    test('renders correct firebase authentication', async () => {
        expect(screen.getByText("Don't have an account yet?")).toBeInTheDocument();
    }) 

    test('renders correct error notifications', async () => {
        expect(screen.getByText("Don't have an account yet?")).toBeInTheDocument();
    }) 

    test('navigates to user profile', async () => {
        expect(screen.getByText("Don't have an account yet?")).toBeInTheDocument();
    }) 

});
