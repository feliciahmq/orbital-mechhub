import Banner from "../../../src/pages/landing/banner/LandingBanner";
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockUseNavigate = require('react-router-dom').useNavigate;

describe('Banner Component', () => {
    beforeEach(() => {
        mockUseNavigate.mockReturnValue(jest.fn());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders Banner with heading, paragraph, and button', () => {
        render(
            <MemoryRouter>
                <Banner />
            </MemoryRouter>
        );

        expect(screen.getByText("My Keyboard Quit Its Job")).toBeInTheDocument();
        expect(screen.getByText("— apparently, it wasn't getting enough 'shift' work!")).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /View All Products/i })).toBeInTheDocument();
    });

    test('navigates to /search when button is clicked', () => {
        const navigate = jest.fn();
        mockUseNavigate.mockReturnValue(navigate);

        render(
            <MemoryRouter>
                <Banner />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: /View All Products/i }));

        expect(navigate).toHaveBeenCalledWith('/search');
    });
});