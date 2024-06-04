import './ProductPage.css';
import Header from '../../components/header/Header';
import Data from "../landing/data.json";
import ProductList from "../landing/ProductList";
import SearchBar from './searchbar/Searchbar';
import ListingButton from '../../components/listingpopup/Button';

function ProductPage() {
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
                    <ListingButton />
            </section>
        </>
    );
}

export default ProductPage;
