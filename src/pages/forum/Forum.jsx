import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Auth';
import { db } from '../../lib/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

import Format from '../../components/format/Format';
import ForumFilter from './filter/ForumFilter';
import ForumList from '../../components/forumcards/ForumList';
import ForumCards from '../../components/forumcards/ForumCards';
import './Forum.css';

function ForumPage() {
    const { currentUser } = useAuth();
    const [forumPosts, setForumPosts] = useState([]);

    const fetchForumPosts = async () => {
        try {
            const forumCollection = await getDocs(collection(db, "Forum"));
            const forumData = await Promise.all(forumCollection.docs.map(async (doc) => {
                const forum = { id: doc.id, ...doc.data() };
                return {...forum};
            }));
            setForumPosts(forumData);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchForumPosts();
    }, []);

    return (
        <Format content={
            <div className='forum'>
                <ForumList heading="forum" forums={forumPosts} />
            </div>
        } />
    );

}

export default ForumPage;