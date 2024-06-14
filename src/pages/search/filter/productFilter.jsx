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
                    <option value='fullBuilds'>Full Builds</option>
                    <option value='keycaps'>Keycaps</option>
                    <option value='switches'>Switches</option>
                    <option value='stabilisers'>Stabilisers</option>
                    <option value='deskmats'>Deskmats</option>
                    <option value='cables'>Cables</option>
                    <option value='groupOrders'>Group Orders</option>
                    <option value='others'>Others</option>
                </select>
            </div>
            <div className="filter-group">
                <label>Price Range:</label>
                <select value={priceRange} onChange={handlePriceChange}>
                    <option value="">All</option>
                    <option value="0-50">0 - 20</option>
                    <option value="21-40">21 - 40</option>
                    <option value="41-100">21 - 40</option>
                    <option value="101-150">101 - 150</option>
                    <option value=">150">150 +</option> 
                    {/* I am unsure of how to filter for the upper bound */}
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
