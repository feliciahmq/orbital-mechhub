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
    const [searchQuery, setSearchQuery] = useState('');
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);

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
            if (listingsData.length > 0) {
                const prices = listingsData.map(product => product.price);
                setMinPrice(Math.min(...prices));
                setMaxPrice(Math.max(...prices));
            }
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
            const [minPrice, maxPrice] = priceRange;
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

    useEffect(() => {
        const search = (query, products) => {
            if (!query) return products;

            const searchQuery = query.toLowerCase();
            return products.filter(product => {
                const name = product.name ? product.name.toLowerCase() : '';
                const productType = product.productType ? product.productType.toLowerCase() : '';
                const description = product.description ? product.description.toLowerCase() : '';
                const username = product.username ? product.username.toLowerCase() : '';
                return name.includes(searchQuery) || description.includes(searchQuery) || productType.includes(searchQuery)
                        || username.includes(searchQuery);
            });
        };

        setFilteredProducts(search(searchQuery, products));
    }, [searchQuery, products]);

    return (
        <div className='content'>
            <header>
                <Header />
            </header>
            <section className='main'>
                <div className='searchbar'>
                    <SearchBar onSearch={setSearchQuery} />
                </div>
                <div className='product-filter'>
                    <ProductFilter 
                        minPrice={minPrice} 
                        maxPrice={maxPrice} 
                        onFilterChange={filterProducts} 
                        onSortChange={setSortOrder} 
                    />
                </div>
                <div className='listing'>
                    <ProductList heading="Products" products={filteredProducts} />
                </div>
                {currentUser && <ListingButton />}
            </section>
        </div>
    );
}

export default SearchPage;