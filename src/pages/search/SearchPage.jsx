import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../Auth';

import Header from '../../components/header/Header';
import ProductList from '../../components/productcards/ProductList';
import SearchBar from './searchbar/Searchbar';
import ListingButton from '../../components/listingpopup/Button';
import ProductFilter from './filter/productFilter';
import './SearchPage.css';

function SearchPage() {
    const { currentUser } = useAuth();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [sortOrder, setSortOrder] = useState('');

    const fetchListings = async () => {
        try {
            const listingsCollection = collection(db, "listings");
            const data = await getDocs(listingsCollection);
            const listingsData = data.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(listingsData);
            setFilteredProducts(listingsData);
        } catch (error) {
            console.log(`Firebase: ${error}`);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const filterProducts = (type, priceRange) => {
        let filtered = products;

        if (type) {
            filtered = filtered.filter(product => product.productType === type);
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
            sorted.sort((a, b) => a.price - b.price);
        } else if (order === 'high-to-low') {
            sorted.sort((a, b) => b.price - a.price);
        }

        return sorted;
    };

    useEffect(() => {
        setFilteredProducts(sortProducts(filteredProducts, sortOrder));
    }, [sortOrder]);

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
