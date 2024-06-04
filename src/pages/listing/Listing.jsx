import React, { useState } from 'react';
import { getDatabase, ref, child, get,set, update, remove } from 'firebase/database';
import './Listing.css';
import Header from '../../components/header/Header';

function ListingPage() {
    const db = getDatabase();

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

    const uploadImage = (e) => {
        const file = e.target.files[0];
        if (file && file.type.includes('image')) {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = (fileReaderEvent) => {
                setFormData({
                    ...formData,
                    image: fileReaderEvent.target.result
                });
            };
        } else {
            alert('Only Images Allowed');
        }
    };

    const adjustTextAreaHeight = (e) => {
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    return (
        <>
            <div>
                <Header />
            </div>
            <div className='form'>
                <form onSubmit={handleSubmit} style={{position: 'relative'}}>
                    <h1>Add Image:</h1>
                    <div className="image-upload">
                        <input required
                            className='file-input'
                            type="file"
                            accept="image/*"
                            name="image"
                            onChange={uploadImage}
                        />
                        {formData.image && (
                            <div
                                className="uploaded-picture"
                                style={{ backgroundImage: `url(${formData.image})` }}
                            ></div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Title:</label>
                        <input required
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Product Type:</label>
                        <input required
                            type="text"
                            name="productType"
                            value={formData.productType}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Price:</label>
                        <input required
                            type="text"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Description:</label>
                        <textarea required
                            name="description"
                            value={formData.description}
                            onChange={(e) => {
                                handleChange(e);
                                adjustTextAreaHeight(e);
                            }}
                        />
                    </div>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </>
    );
}

export default ListingPage;
