import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import './Searchbar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?query=${query}`);
  };

  return (
    <div className="search-bar-container">
		<form onSubmit={handleSearch}>
			<input
			type="text"
			className="search-bar-input"
			value={query}
			onChange={handleInputChange}
			placeholder='Search Products'
			/>
			<button type="submit" className="search-bar-button">
				<FaSearch />
			</button>
		</form>
    </div>
  );
};

export default SearchBar;