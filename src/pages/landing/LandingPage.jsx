import React, { useRef, useEffect, useState } from 'react';
import Header from '../../components/header/Header';
import Categories from "./categories/Categories";
import Data from "./data.json";
import ProductList from "./ProductList";
import Banner from "./banner/Banner";
import './LandingPage.css';

function LandingPage() {
    const headerContainerRef = useRef(null);
    const [totalHeight, setTotalHeight] = useState('auto');

    useEffect(() => {
        const calculateHeight = () => {
            if (headerContainerRef.current) {
                const headerElements = headerContainerRef.current.children;
                const combinedHeight = Array.from(headerElements).reduce((acc, element) => {
                    return acc + element.offsetHeight + 102;
                }, 0);
                setTotalHeight(combinedHeight);
            }
        };

        calculateHeight();

        window.addEventListener('resize', calculateHeight);

        return () => window.removeEventListener('resize', calculateHeight);
    }, []);

    return (
        <div>
            <header style={{ height: totalHeight }} ref={headerContainerRef} className="header-container">
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
