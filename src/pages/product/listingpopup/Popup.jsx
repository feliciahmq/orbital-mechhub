import React, { useState } from 'react';
import './Popup.css'; // Create and import CSS for styling the popup

function Popup({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        title: '',
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
            productType: '',
            price: '',
            description: ''
        });
    };

    return (
        <div className="popup-overlay">
            <div className="popup">
                <button className="close-button" onClick={onClose}>X</button>
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
            </div>
        </div>
    );
}

export default Popup;
