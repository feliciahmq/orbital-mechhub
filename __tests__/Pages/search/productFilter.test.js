import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ProductFilter from '../../../src/pages/search/filter/productFilter';

import '@testing-library/jest-dom';

describe('ProductFilter', () => {
    const mockOnFilterChange = jest.fn();
    const mockOnSortChange = jest.fn();
    const minPrice = 0;
    const maxPrice = 1000;

    const getFormControlByLabel = (labelText) => {
        return screen.getByLabelText(labelText, { 
            selector: 'input, textarea, select' 
        });
    };

    beforeEach(() => {
        render(
        <ProductFilter
            minPrice={minPrice}
            maxPrice={maxPrice}
            onFilterChange={mockOnFilterChange}
            onSortChange={mockOnSortChange}
        />
        );
    });

    test('renders all filter options', () => {
        expect(getFormControlByLabel('Product Type:')).toBeInTheDocument();
        expect(getFormControlByLabel('Sort By:')).toBeInTheDocument();
    });

    test('changes product type and calls onFilterChange', () => {
        const select = getFormControlByLabel('Product Type:');
        fireEvent.change(select, { target: { value: 'keycaps' } });
        expect(mockOnFilterChange).toHaveBeenCalledWith('keycaps', [minPrice, maxPrice]);
    });

    test('changes price range and calls onFilterChange', () => {
        const minInput = screen.getAllByRole('slider')[0];
        const maxInput = screen.getAllByRole('slider')[1];

        fireEvent.change(minInput, { target: { value: '100' } });
        expect(mockOnFilterChange).toHaveBeenCalledWith('', [100, maxPrice]);

        fireEvent.change(maxInput, { target: { value: '900' } });
        expect(mockOnFilterChange).toHaveBeenCalledWith('', [100, 900]);
    });

    test('changes sort order and calls onSortChange', () => {
        const select = getFormControlByLabel('Sort By:');
        fireEvent.change(select, { target: { value: 'low-to-high' } });
        expect(mockOnSortChange).toHaveBeenCalledWith('low-to-high');
    });
});