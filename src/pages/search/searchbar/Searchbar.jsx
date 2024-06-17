import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

import './Searchbar.css'; 

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (e) => {
      const value = e.target.value;
      setQuery(value);
      onSearch(value);
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-bar-input"
        value={query} 
        onChange={handleInputChange} 
        placeholder='Search Products'
      />
      <button className="search-bar-button">
        <FaSearch />
      </button>
    </div>
  );
};

export default SearchBar;
