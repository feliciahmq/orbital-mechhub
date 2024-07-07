import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Auth';

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
        <div className='filter-container'>
            <div className='filter-group'>
                <label>Tags</label>
                <div className="tags-container">
                    {availableTags.map((tag) => (
                        <button 
                            type="button" 
                            key={tag} 
                            className={`tag-button ${selectedTags.includes(tag) ? 'selected' : ''}`}
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
    );
}

export default ForumFilter;