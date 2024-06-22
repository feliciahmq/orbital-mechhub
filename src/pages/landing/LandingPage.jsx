import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from '../../Auth'; 

import Header from '../../components/header/Header';
import ProductList from '../../components/productcards/ProductList';
import Banner from "./banner/LandingBanner";
import ListingButton from '../../components/listingpopup/Button';
import './LandingPage.css';

function LandingPage() {
    const { currentUser } = useAuth();
    const [listings, setListings] = useState([]);

    const fetchListings = async () => {
        try {
            const listingsCollection = query(
                collection(db, "listings"),
                where('status', '==', 'available')
            );
            const data = await getDocs(listingsCollection);
            const listingsData = data.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setListings(listingsData);
        } catch (error) {
            console.error(`Firebase fetch error: ${error.message}`);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    return (
        <div className='landing-page'>
            <div className='header-section'>
                <header className="header-container">
                    <Header />
                    <Banner />
                </header>
            </div>
            <div className='main'>
                <section>
                    <div>
                        <ProductList heading="Featured Products" products={listings} />
                    </div>
                    {currentUser && <ListingButton />}
                </section>
            </div>
        </div>
    );
}

export default LandingPage;
