import React, { useState } from 'react';

import './ProductPage.css';
import Header from '../../components/header/Header';
import Data from "../landing/data.json";
import ProductList from "../landing/ProductList";
import Popup from './listingpopup/Popup';
import SearchBar from './searchbar/Searchbar';

function ProductPage() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleOpenPopup = () => {
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
    };

    const handleSubmit = (inputValue) => {
        console.log('Submitted value:', inputValue);
        setIsPopupOpen(false);
    };

    return (
        <>
            <header>
                <Header />
                <SearchBar />
            </header>
            <section className='main'>
                <div className='listing'>
                  <ProductList heading="Products" products={Data.featured} />
                </div>
                <div className="listing-button">
                <button onClick={handleOpenPopup}>+</button>
                    {isPopupOpen && <Popup onClose={handleClosePopup} onSubmit={handleSubmit} />}
                </div>
            </section>
    
        </>
    );
}

export default ProductPage;
