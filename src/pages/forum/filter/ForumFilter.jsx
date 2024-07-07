import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Auth';

import SearchBar from '../../../components/searchbar/Searchbar';
import './ForumFilter.css';

function ForumFilter({ onFilterChange }) {
    const { currentUser } = useAuth();
    const [selectedTags, setSelectedTags] = useState([]);
    const [sortOrder, setSortOrder] = useState('');

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

    useEffect(() => {
        onFilterChange({ tags: selectedTags, sortOrder });
    }, [selectedTags, sortOrder]);

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
            <SearchBar placeholder={"Search Forum Posts..."} />
        </div>
    );
}

export default ForumFilter;