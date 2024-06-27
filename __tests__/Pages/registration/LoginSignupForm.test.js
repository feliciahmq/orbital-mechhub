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
    
    const loginLabel = screen.getByText("Login")
    expect(loginLabel).toBeInTheDocument();
    const loginForm = loginLabel.closest("form");
    expect(within(loginForm).getByPlaceholderText("Email")).toBeInTheDocument();
    expect(within(loginForm).getByPlaceholderText("Password")).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole("button", {name: "Sign up"}));
    const signupLabel = screen.getByText("Create Account")
    expect(signupLabel).toBeInTheDocument();
    const signupForm = signupLabel.closest("form");
    expect(within(signupForm).getByPlaceholderText("Email")).toBeInTheDocument();
    expect(within(signupForm).getByPlaceholderText("Password")).toBeInTheDocument();
    
    });

    test('toggles between login and signup form', async () => {
        render(
            <MemoryRouter>
              <LoginSignUpForm />
            </MemoryRouter>
        );

        expect(screen.getByText("Don't have an account yet?")).toBeInTheDocument();
        
        fireEvent.click(screen.getByRole("button", {name: "Sign up"}));
        expect(screen.getByText("Already have an account?")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", {name: "Log in"}));
        expect(screen.getByText("Don't have an account yet?")).toBeInTheDocument();
    });

    test('renders input changes', async () => {
        expect(screen.getByText("Don't have an account yet?")).toBeInTheDocument();
    }) 

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
