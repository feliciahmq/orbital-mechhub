import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../Auth';
import { db } from '../../lib/firebaseConfig';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';

import Format from '../../components/format/Format';
import ForumFilter from './filter/ForumFilter';
import ForumList from '../../components/forumcards/ForumList';
import './Forum.css';

function ForumPage() {
    const [forumPosts, setForumPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [sortOrder, setSortOrder] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchForumPosts = async () => {
        try {
            const forumCollection = await getDocs(collection(db, "Forum"));
            const forumData = await Promise.all(forumCollection.docs.map(async (doc) => {
                const forum = { id: doc.id, ...doc.data() };
                const weeklyClicks = await getWeeklyClicks(doc.id);
                const likes = await getLikes(doc.id);
                const comments = await getComments(doc.id);
                return { ...forum, weeklyClicks, likes, comments };
            }));
            setForumPosts(forumData);
            setFilteredPosts(forumData);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchForumPosts();
    }, []);

    const getWeeklyClicks = async (forumID) => {
        const weekStart = getWeekStart();
        const clickCountDoc = await getDoc(doc(db, 'Forum', forumID, 'clickCount', weekStart.toString()));
        return clickCountDoc.exists() ? clickCountDoc.data().count : 0;
    };

    const getLikes = async (forumID) => {
        const likesCollection = collection(db, 'Forum', forumID, 'Likes');
        const likesSnapshot = await getDocs(likesCollection);
        return likesSnapshot.size;
    };

    const getComments = async (forumID) => {
        const commentsCollection = collection(db, 'Forum', forumID, 'comments');
        const commentsSnapshot = await getDocs(commentsCollection);
        return commentsSnapshot.size;
    };

    const getWeekStart = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        return new Date(now.setDate(diff)).setHours(0, 0, 0, 0);
    };

    const calculateFeaturedScore = (product) => {
        const { weeklyClicks, likes, comments } = product;
        return (weeklyClicks * 0.5) + (likes * 0.3) + (comments * 0.2);
    };

    const filterAndSortPosts = useCallback(({ tags, sortOrder, searchQuery }) => {
        let filtered = forumPosts;

        if (tags && tags.length > 0) {
            filtered = filtered.filter(post =>
                tags.some(tag => post.tags.includes(tag))
            );
        }

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(lowerQuery) ||
                post.description.toLowerCase().includes(lowerQuery)
            );
        }

        if (sortOrder === 'new') {
            filtered.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        } else if (sortOrder === 'featured') {
            filtered.sort((a, b) => calculateFeaturedScore(b) - calculateFeaturedScore(a));
        }

        setFilteredPosts(filtered);
        setSortOrder(sortOrder);
        setSearchQuery(searchQuery);
    }, [forumPosts]);

    return (
        <Format content={
            <div className='forum'>
                <ForumFilter 
                    onFilterChange={filterAndSortPosts}
                    onSortChange={(order) => filterAndSortPosts({ tags: [], sortOrder: order, searchQuery })}
                />
                <div className='forum-main'>
                    <ForumList heading="Forum" forums={filteredPosts} />
                </div>
            </div>
        } />
    );
}

export default ForumPage;