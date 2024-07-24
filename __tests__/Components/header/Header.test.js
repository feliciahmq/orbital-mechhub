import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from '../../../src/Auth';
import { useLikes } from '../../../src/components/header/likecounter/LikeCounter';
import Header from '../../../src/components/header/Header';
import '@testing-library/jest-dom';

jest.mock('../../../src/Auth');
jest.mock('../../../src/components/header/likecounter/LikeCounter');

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

    test('renders the logo', () => {
        const { container } = render(
            <Router>
                <Header />
            </Router>
        );

        const logo = container.querySelector('.MechHub_Logo');
        expect(logo).toBeInTheDocument();
    });

    test('navigates to home on click', () => {
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

    test('renders profile, chat, notification and likes link when user is logged in', () => {
        render(
            <Router>
                <Header />
            </Router>
        );

        expect(screen.getByRole('img', { class: 'MechHub_Logo' })).toBeInTheDocument();
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