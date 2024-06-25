import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { useAuth } from '../../Auth'; 

import './Searchbar.css';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        await trackSearchHistory(query);
        navigate(`/search?query=${query}`);
    };

    const trackSearchHistory = async (query) => {
        if (currentUser && query) {
            try {
                await addDoc(collection(db, 'userHistory', currentUser.uid, 'searchHistory'), {
                    query,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error tracking search history:', error);
            }
        }
    };

    return (
        <div className="search-bar-container">
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    className="search-bar-input"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search Products"
                />
                <button type="submit" className="search-bar-button">
                    <FaSearch />
                </button>
            </form>
        </div>
    );
};

export default SearchBar;