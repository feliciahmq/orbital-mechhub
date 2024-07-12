import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Auth';

import SearchBar from '../../../components/searchbar/Searchbar';
import './ForumFilter.css';

function ForumFilter({ onFilterChange }) {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [selectedTags, setSelectedTags] = useState([]);
    const [sortOrder, setSortOrder] = useState('');
    const [query, setQuery] = useState('');

    const availableTags = ["Questions", "Modding", "Reviews", "Showcase"];

    const handleTagClick = (tag) => {
        setSelectedTags(prevTags =>
            prevTags.includes(tag)
                ? prevTags.filter(t => t !== tag)
                : [...prevTags, tag]
        );
    };

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        onFilterChange({ tags: selectedTags, sortOrder, searchQuery: query });
    };

    useEffect(() => {
        onFilterChange({ tags: selectedTags, sortOrder, searchQuery: query });
    }, [selectedTags, sortOrder, query]);

    return (
        <div className='forum-filter'>
            <div className='forum-filter-container'>
                <div className='forum-filter-group'>
                    <label>Tags</label>
                    <div className="tags-container">
                        {availableTags.map((tag) => (
                            <button
                                type="button"
                                key={tag}
                                className={`tag-button-filter ${selectedTags.includes(tag) ? 'selected' : ''}`}
                                onClick={() => handleTagClick(tag)}
                                data-tag={tag}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="filter-group">
                    <label>Sort By:</label>
                    <select value={sortOrder} onChange={handleSortChange}>
                        <option value="">None</option>
                        <option value="new">New</option>
                        <option value="featured">Featured</option>
                    </select>
                </div>
            </div>
            <div  className='forum-searchbar'>
                <SearchBar
                    placeholder={"Search Forum Posts..."}
                    handleSearch={handleSearch}
                    handleInputChange={handleInputChange}
                    query={query}
                />
            </div>
        </div>
    );
}

export default ForumFilter;