import React from 'react';
import './Searchbar.css'; // Importing the CSS file

const SearchBar = ({ onChange, placeholder }) => {
  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-bar-input"
        onChange={onChange}
        placeholder={placeholder}
      />
      <button className="search-bar-button">
        <i className="fas fa-search"></i>
      </button>
    </div>
  );
};

export default SearchBar;
