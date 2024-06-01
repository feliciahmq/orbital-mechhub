import React from 'react';
import Header from "./header/Header";
import Categories from "./categories/Categories";
import Data from "./data.json";
import ProductList from "./ProductList";
import Banner from "./banner/Banner";
import './LandingPage.css';

function LandingPage() {
    return (
        <div>
            <header>
                <Header />
                <Banner />
            </header>
            <section className='main'>
                <div>
                    <Categories />
                </div>
                <div>
                    <ProductList heading="Featured Products" products={Data.featured} />
                </div>
            </section>
        </div>
    );
}

export default LandingPage;
