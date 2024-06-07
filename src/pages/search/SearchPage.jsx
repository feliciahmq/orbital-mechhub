import React, { useState, useEffect } from 'react';
import './SearchPage.css';
import Header from '../../components/header/Header';
import Data from "../landing/data.json";
import ProductList from '../../components/productcards/ProductList';
import SearchBar from './searchbar/Searchbar';
import ListingButton from '../../components/listingpopup/Button';
import { useAuth } from '../../Auth';
import ProductFilter from './filter/productFilter';

function SearchPage() {
    const { currentUser } = useAuth();
    const [products, setProducts] = useState(Data.featured);
    const [filteredProducts, setFilteredProducts] = useState(Data.featured);
    const [sortOrder, setSortOrder] = useState('');

    const filterProducts = (type, priceRange) => {
        let filtered = Data.featured;

        if (type) {
            filtered = filtered.filter(product => product.type === type);
        }

        if (priceRange) {
            const [minPrice, maxPrice] = priceRange.split('-').map(Number);
            filtered = filtered.filter(product => product.price >= minPrice && product.price <= maxPrice);
        }

        setFilteredProducts(filtered);
    };

    const sortProducts = (productsToSort, order) => {
        let sorted = [...productsToSort];

        if (order === 'low-to-high') {
            sorted = sorted.sort((a, b) => a.price - b.price);
        } else if (order === 'high-to-low') {
            sorted = sorted.sort((a, b) => b.price - a.price);
        }

        return sorted;
    };

    useEffect(() => {
        setFilteredProducts(sortProducts(filteredProducts, sortOrder));
    }, [sortOrder, filteredProducts]);

    return (
        <>
            <header>
                <Header />
            </header>
            <section className='main'>
                <div className='searchbar'>
                    <SearchBar />
                </div>
                <div className='product-filter'>
                    <ProductFilter onFilterChange={filterProducts} onSortChange={setSortOrder} />
                </div>
                <div className='listing'>
                    <ProductList heading="Products" products={filteredProducts} />
                </div>
                {currentUser && <ListingButton />}
            </section>
        </>
    );
}

export default SearchPage;
