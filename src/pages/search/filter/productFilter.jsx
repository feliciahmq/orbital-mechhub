import React, { useState, useEffect } from 'react';
import './productFilter.css';

function ProductFilter({ minPrice, maxPrice, onFilterChange, onSortChange }) {
    const [type, setType] = useState('');
    const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
    const [sortOrder, setSortOrder] = useState('');

    useEffect(() => {
        setPriceRange([minPrice, maxPrice]);
    }, [minPrice, maxPrice]);

    const handleTypeChange = (e) => {
        setType(e.target.value);
        onFilterChange(e.target.value, priceRange);
    };

    const handleMinPriceChange = (e) => {
        const newMinPrice = parseInt(e.target.value, 10);
        if (newMinPrice <= priceRange[1]) {
            setPriceRange([newMinPrice, priceRange[1]]);
            onFilterChange(type, [newMinPrice, priceRange[1]]);
        }
    };

    const handleMaxPriceChange = (e) => {
        const newMaxPrice = parseInt(e.target.value, 10);
        if (newMaxPrice >= priceRange[0]) {
            const newPriceRange = [priceRange[0], newMaxPrice];
            setPriceRange(newPriceRange);
            onFilterChange(type, newPriceRange);
        }
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
                <div className="slider-container">
                    <div className="slider">
                        <div className="inside" style={{
                            left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                            right: `${100 - ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`
                        }}></div>
                    </div>
                    <div className="range">
                        <input
                            type="range"
                            min={minPrice}
                            max={maxPrice}
                            value={priceRange[0]}
                            onChange={handleMinPriceChange}
                        />
                        <input
                            type="range"
                            min={minPrice}
                            max={maxPrice}
                            value={priceRange[1]}
                            onChange={handleMaxPriceChange}
                        />
                    </div>
                    <div className='display'>
                        <span>{priceRange[0]}</span> - <span>{priceRange[1]}</span>
                    </div>
                </div>
            </div>
            <div className="filter-group">
                <label>Sort By:</label>
                <select value={sortOrder} onChange={handleSortChange}>
                    <option value="">None</option>
                    <option value="best-match">Best Match</option>
                    <option value="featured">Featured</option>
                    <option value="low-to-high">Price: Low to High</option>
                    <option value="high-to-low">Price: High to Low</option>
                </select>
            </div>
        </div>
    );
}

export default ProductFilter;