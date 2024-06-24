import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { useAuth } from '../../Auth';
import { useLocation } from 'react-router-dom';

import Header from '../../components/header/Header';
import ProductList from '../../components/productcards/ProductList';
import ListingButton from '../../components/listingpopup/Button';
import ProductFilter from './filter/productFilter';
import './SearchPage.css';

function SearchPage() {
    const { currentUser } = useAuth();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [sortOrder, setSortOrder] = useState('');

    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('query') || '';

    const fetchListings = async () => {
        try {
            const listingsCollection = query(
                collection(db, "listings"),
                where('status', '==', 'available')
            );
            const data = await getDocs(listingsCollection);
            const listingsData = await Promise.all(data.docs.map(async (doc) => {
                const listing = { id: doc.id, ...doc.data() };
                const weeklyClicks = await getWeeklyClicks(doc.id);
                const likes = await getLikes(doc.id);
                const offers = await getOffers(doc.id);
                return { ...listing, weeklyClicks, likes, offers };
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

    const getWeeklyClicks = async (listingId) => {
        const weekStart = getWeekStart();
        const clickCountDoc = await getDoc(doc(db, 'listings', listingId, 'clickCount', weekStart.toString()));
        return clickCountDoc.exists() ? clickCountDoc.data().count : 0;
    };

    const getLikes = async (listingId) => {
        const likesCollection = query(collection(db, 'Likes'), where('listingID', '==', listingId));
        const likesSnapshot = await getDocs(likesCollection);
        return likesSnapshot.size;
    };

    const getOffers = async (listingId) => {
        const offersCollection = collection(db, 'listings', listingId, 'offers');
        const offersSnapshot = await getDocs(offersCollection);
        return offersSnapshot.size;
    };

    const getWeekStart = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
        return new Date(now.setDate(diff)).setHours(0, 0, 0, 0);
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

    const sortProducts = (productsToSort, order, query) => {
        let sorted = [...productsToSort];

        if (order === 'low-to-high') {
            sorted.sort((a, b) => a.price - b.price);
        } else if (order === 'high-to-low') {
            sorted.sort((a, b) => b.price - a.price);
        } else if (order === 'best-match') {
            sorted = sorted.sort((a, b) => calculateRelevance(b, query) - calculateRelevance(a, query));
        } else if (order === 'featured') {
            sorted.sort((a, b) => calculateFeaturedScore(b) - calculateFeaturedScore(a));
        }

        return sorted;
    };

    const calculateRelevance = (product, query) => {
        const lowerCaseQuery = query.toLowerCase();
        let relevance = 0;

        if (product.name?.toLowerCase().includes(lowerCaseQuery)) relevance += 3;
        if (product.description?.toLowerCase().includes(lowerCaseQuery)) relevance += 2;
        if (product.productType?.toLowerCase().includes(lowerCaseQuery)) relevance += 1;

        return relevance;
    };

    const calculateFeaturedScore = (product) => {
        const { weeklyClicks, likes, offers } = product;
        return (weeklyClicks * 0.5) + (likes * 0.3) + (offers * 0.2);
    };

    useEffect(() => {
        setFilteredProducts(sortProducts(filteredProducts, sortOrder, searchQuery));
    }, [sortOrder, searchQuery]);

    useEffect(() => {
        const search = (query, products) => {
            if (!query) return products;

            const searchQuery = query.toLowerCase();
                    console.log(searchQuery);
            return products.filter(product => {
                const name = product.title ? product.title.toLowerCase() : '';
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