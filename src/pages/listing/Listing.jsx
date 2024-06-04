import React, {useState} from 'react';

import './Listing.css';
import Header from '../../components/header/Header';

function ListingPage() {
    const [formData, setFormData] = useState({
        title: '',
        image: '',
        productType: '',
        price: '',
        description: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({
            title: '',
            image: '',
            productType: '',
            price: '',
            description: ''
        });
    };

    return (
        <>
        <Header />
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Title:</label>
                    <input 
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="form-group">
                    <label>Add Image:</label>
                    <input 
                        type="file"
                        accept="image/*"
                        name="image" 
                        value={formData.image} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="form-group">
                    <label>Product Type:</label>
                    <input 
                        type="text" 
                        name="productType" 
                        value={formData.productType} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="form-group">
                    <label>Price:</label>
                    <input 
                        type="text" 
                        name="price" 
                        value={formData.price} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="form-group">
                    <label>Description:</label>
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
        </>
    );
}

export default ListingPage;