import React, { useState } from 'react';
import './productFilter.css';

function ProductFilter({ onFilterChange, onSortChange }) {
    const [type, setType] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [sortOrder, setSortOrder] = useState('');

    const handleTypeChange = (e) => {
        setType(e.target.value);
        onFilterChange(e.target.value, priceRange);
    };

    const handlePriceChange = (e) => {
        setPriceRange(e.target.value);
        onFilterChange(type, e.target.value);
    };

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
        onSortChange(e.target.value);
    };

    return (
        <div className="filter-container">
            <div className="filter-group">
                <label>Product Type:</label>
                <select value={type} onChange={handleTypeChange}>
                    <option value="">All</option>
                    <option value="type1">Type 1</option>
                    <option value="type2">Type 2</option>
                    <option value="type3">Type 3</option>
                </select>
            </div>
            <div className="filter-group">
                <label>Price Range:</label>
                <select value={priceRange} onChange={handlePriceChange}>
                    <option value="">All</option>
                    <option value="0-50">0 - 50</option>
                    <option value="51-100">51 - 100</option>
                    <option value="101-150">101 - 150</option>
                </select>
            </div>
            <div className="filter-group">
                <label>Sort By:</label>
                <select value={sortOrder} onChange={handleSortChange}>
                    <option value="">None</option>
                    <option value="low-to-high">Price: Low to High</option>
                    <option value="high-to-low">Price: High to Low</option>
                </select>
            </div>
        </div>
    );
}

export default ProductFilter;
