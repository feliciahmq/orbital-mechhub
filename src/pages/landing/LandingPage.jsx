import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from '../../Auth'; 

import Header from '../../components/header/Header';
import Categories from "./categories/LandingCategories";
import ProductList from '../../components/productcards/ProductList';
import Banner from "./banner/LandingBanner";
import ListingButton from '../../components/listingpopup/Button';
import './LandingPage.css';

function LandingPage() {
    const { currentUser } = useAuth();
    const [listings, setListings] = useState([]);

    const fetchListings = async () => {
        try {
            const listingsCollection = collection(db, "listings");
            const data = await getDocs(listingsCollection);
            const listingsData = data.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setListings(listingsData);
        } catch (error) {
            console.log(`Firebase: ${error}`);
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
                        <Categories />
                    </div>
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
