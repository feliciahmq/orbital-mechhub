import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";
import { useAuth } from '../../Auth'; 

import Format from '../../components/format/Format';
import ProductList from '../../components/productcards/ProductList';
import Banner from "./banner/LandingBanner";
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
            const listingsData = await Promise.all(data.docs.map(async (doc) => {
                const listing = { id: doc.id, ...doc.data() };
                const weeklyClicks = await getWeeklyClicks(doc.id);
                const likes = await getLikes(doc.id);
                const offers = await getOffers(doc.id);
                return { ...listing, weeklyClicks, likes, offers };
            }));
            const sortedListings = sortListingsByFeaturedScore(listingsData);
            setListings(sortedListings.slice(0, 4));
        } catch (error) {
            console.error(`Firebase fetch error: ${error.message}`);
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

    const sortListingsByFeaturedScore = (listings) => {
        return listings.sort((a, b) => calculateFeaturedScore(b) - calculateFeaturedScore(a));
    };

    const calculateFeaturedScore = (product) => {
        const { weeklyClicks, likes, offers } = product;
        return (weeklyClicks * 0.5) + (likes * 0.3) + (offers * 0.2);
    };

    useEffect(() => {
        fetchListings();
    }, []);

    return (
        <Format content={
            <div className='landing-page'>
                <div className='header-section'>
                    <header className="header-container">
                        <Banner />
                    </header>
                </div>
                <div className='main'>
                    <section>
                        <div>
                            <ProductList heading="Featured Products" products={listings} />
                        </div>
                    </section>
                </div>
            </div>
        } />
    );
}

export default LandingPage;