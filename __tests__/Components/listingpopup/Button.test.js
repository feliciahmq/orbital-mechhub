import ListingButton from '../../../src/components/listingpopup/Button';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

test('navigates to /listing when the button is clicked', () => {
    render(
        <MemoryRouter>
            <ListingButton />
        </MemoryRouter>
    );

    const button = screen.getByText('+ New Listing');
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/listing');
});