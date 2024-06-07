import React from 'react';
import Header from '../../components/header/Header';
import Categories from "./categories/Categories";
import Data from "./data.json";
import ProductList from '../../components/productcards/ProductList';
import Banner from "./banner/Banner";
import { useAuth } from '../../Auth'; 
import ListingButton from '../../components/listingpopup/Button';
import './LandingPage.css';

function LandingPage() {
    const { currentUser } = useAuth();

    return (
        <div className='landing-page'>
            <div className='header-section'>
                <header className="header-container">
                    <Header />
                    <Banner />
                </header>
            </div>
            <div className='main'>
                <section >
                    <div>
                        <Categories />
                    </div>
                    <div>
                        <ProductList heading="Featured Products" products={Data.featured} />
                    </div>
                    {currentUser && <ListingButton />}
            </section>
        </div>
    </div>
    );
}

export default LandingPage
