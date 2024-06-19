import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from '../../Auth';
import { useLikes } from './likecounter/LikeCounter';
import Header from './Header';
import '@testing-library/jest-dom';

jest.mock('../../Auth');
jest.mock('./likecounter/LikeCounter');

describe('Header', () => {
    beforeEach(() => {
        useAuth.mockReturnValue({
            currentUser: {
                uid: '123',
            },
        });

        useLikes.mockReturnValue({
            likeCount: 5,
        });
    });

    test('renders the logo and navigates to home on click', () => {
        const { container } = render(
            <Router>
                <Header />
            </Router>
        );

        const logo = container.querySelector('.MechHub_Logo');
        expect(logo).toBeInTheDocument();
        fireEvent.click(logo);

        expect(window.location.pathname).toBe('/');
    });

    test('toggles the menu on hamburger click', () => {
        const { container } = render(
            <Router>
                <Header />
            </Router>
        );

        const hamburger = container.querySelector('.hamburger');
        const menu = container.querySelector('ul');

        expect(menu).toHaveClass('closed');

        fireEvent.click(hamburger);

        expect(menu).toHaveClass('open');

        fireEvent.click(hamburger);

        expect(menu).toHaveClass('closed');
    });

    test('renders profile and likes link when user is logged in', () => {
        render(
            <Router>
                <Header />
            </Router>
        );

        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText(/Liked:/)).toBeInTheDocument();
        expect(screen.getByText(/5/)).toBeInTheDocument();
    });

    test('renders register/login link when no user is logged in', () => {
        useAuth.mockReturnValueOnce({ currentUser: null });

        render(
            <Router>
                <Header />
            </Router>
        );

        expect(screen.getByText('Register/ Login')).toBeInTheDocument();
    });
});