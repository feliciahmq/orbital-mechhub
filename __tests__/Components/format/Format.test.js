import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Format from '../../../src/components/format/Format';

jest.mock('../../../src/components/header/Header', () => () => <div data-testid="header">Header</div>);
jest.mock('../../../src/components/navbar/Navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('../../../src/components/mobileNavbar/MobileNavbar', () => () => <div data-testid="mobile-navbar">Mobile Navbar</div>);

describe('Format Component', () => {
    const mockContent = <div data-testid="mock-content">Mock Content</div>;

    beforeAll(() => {
        Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
        });
    });

    it('renders header, navbar, and content on desktop', () => {
        render(<Format content={mockContent} />);

        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('mock-content')).toBeInTheDocument();
        expect(screen.queryByTestId('mobile-navbar')).not.toBeInTheDocument();
    });

    it('renders header, mobile navbar, and content on mobile', () => {
        window.innerWidth = 500;
        fireEvent(window, new Event('resize'));

        render(<Format content={mockContent} />);

        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
        expect(screen.getByTestId('mock-content')).toBeInTheDocument();
        expect(screen.getByTestId('mobile-navbar')).toBeInTheDocument();
    });

    it('switches between desktop and mobile layout on resize', () => {
        const { rerender } = render(<Format content={mockContent} />);

        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.queryByTestId('mobile-navbar')).not.toBeInTheDocument();

        window.innerWidth = 500;
        fireEvent(window, new Event('resize'));
        rerender(<Format content={mockContent} />);

        expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
        expect(screen.getByTestId('mobile-navbar')).toBeInTheDocument();

        window.innerWidth = 1024;
        fireEvent(window, new Event('resize'));
        rerender(<Format content={mockContent} />);

        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.queryByTestId('mobile-navbar')).not.toBeInTheDocument();
    });
});