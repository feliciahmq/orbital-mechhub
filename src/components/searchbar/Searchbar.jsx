import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { useAuth } from '../../Auth'; 

import './Searchbar.css';

const SearchBar = ({placeholder, handleSearch, handleInputChange, query}) => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    return (
        <div className="search-bar-container">
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    className="search-bar-input"
                    value={query}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                />
                <button type="submit" className="search-bar-button">
                    <FaSearch />
                </button>
            </form>
        </div>
    );
};

export default SearchBar;