import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";
import { useAuth } from '../../Auth'; 

import Format from '../../components/format/Format';
import ProductList from '../../components/productcards/ProductList';
import ForumList from '../../components/forumcards/ForumList';
import Banner from "./banner/LandingBanner";
import './LandingPage.css';

function LandingPage() {
    const { currentUser } = useAuth();
    const [listings, setListings] = useState([]);
    const [posts, setPosts] = useState([]);

    const fetchListings = async () => {
        try {
            const listingsCollection = query(
                collection(db, "listings"),
                where('status', '==', 'available')
            );
            const data = await getDocs(listingsCollection);
            const listingsData = await Promise.all(data.docs.map(async (doc) => {
                const listing = { id: doc.id, ...doc.data() };
                const weeklyClicks = await getListingWeeklyClicks(doc.id);
                const likes = await getListingLikes(doc.id);
                const offers = await getOffers(doc.id);
                return { ...listing, weeklyClicks, likes, offers };
            }));
            const sortedListings = sortListingsByFeaturedScore(listingsData);
            setListings(sortedListings.slice(0, 4));
        } catch (error) {
            console.error(`Firebase fetch error: ${error.message}`);
        }
    };

    const getListingWeeklyClicks = async (listingId) => {
        const weekStart = getWeekStart();
        const clickCountDoc = await getDoc(doc(db, 'listings', listingId, 'clickCount', weekStart.toString()));
        return clickCountDoc.exists() ? clickCountDoc.data().count : 0;
    };

    const getListingLikes = async (listingId) => {
        const likesCollection = query(collection(db, 'Likes'), where('listingID', '==', listingId));
        const likesSnapshot = await getDocs(likesCollection);
        return likesSnapshot.size;
    };

    const getOffers = async (listingId) => {
        const offersCollection = collection(db, 'listings', listingId, 'offers');
        const offersSnapshot = await getDocs(offersCollection);
        return offersSnapshot.size;
    };

    const getWeekStart = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
        return new Date(now.setDate(diff)).setHours(0, 0, 0, 0);
    };

    const sortListingsByFeaturedScore = (listings) => {
        return listings.sort((a, b) => calculateListingsFeaturedScore(b) - calculateListingsFeaturedScore(a));
    };

    const calculateListingsFeaturedScore = (product) => {
        const { weeklyClicks, likes, offers } = product;
        return (weeklyClicks * 0.5) + (likes * 0.3) + (offers * 0.2);
    };

    const fetchPosts = async () => {
        try {
            const forumCollection = query(
                collection(db, "Forum"),
            );
            const data = await getDocs(forumCollection);
            const forumData = await Promise.all(data.docs.map(async (doc) => {
                const forum = { id: doc.id, ...doc.data() };
                const weeklyClicks = await getForumWeeklyClicks(doc.id);
                const likes = await getForumLikes(doc.id);
                const comments = await fetchCommentsRecursively(doc.id);
                return { ...forum, weeklyClicks, likes, comments };
            }));
            const sortedForum = sortForumByFeaturedScore(forumData);
            setPosts(sortedForum.slice(0, 4));
        } catch (error) {
            console.error(`Firebase fetch error: ${error.message}`);
        }
    };
    
    const getForumWeeklyClicks = async (postID) => {
        const weekStart = getWeekStart();
        const clickCountDoc = await getDoc(doc(db, 'Forum', postID, 'clickCount', weekStart.toString()));
        return clickCountDoc.exists() ? clickCountDoc.data().count : 0;
    };

    const getForumLikes = async (postID) => {
        const likesSnapshot = await getDocs(collection(db, 'Forum', postID, 'Likes'));
        return likesSnapshot.size;
    };


    const countCommentsAndReplies = (comments) => {
        return comments.reduce((total, comment) => {
            return total + 1 + (comment.replies ? countCommentsAndReplies(comment.replies) : 0);
        }, 0);
    };

    const fetchCommentsRecursively = async (postID, parentRef = null) => {
        const commentsQuery = parentRef 
            ? query(collection(parentRef, 'Replies'))
            : query(collection(db, 'Forum', postID, 'Comments'));
        const commentsSnapshot = await getDocs(commentsQuery);
        
        const fetchedComments = await Promise.all(commentsSnapshot.docs.map(async doc => {
            const comment = { id: doc.id, ...doc.data() };
            comment.replies = await fetchCommentsRecursively(postID, doc.ref);
            return comment;
        }));
    
        if (!parentRef) {
            const totalCount = countCommentsAndReplies(fetchedComments);
        }
    
        return fetchedComments;
    };

    const sortForumByFeaturedScore = (posts) => {
        return posts.sort((a, b) => calculateForumFeaturedScore(b) - calculateForumFeaturedScore(a));
    };

    const calculateForumFeaturedScore = (post) => {
        const { weeklyClicks, likes, comments } = post;
        return (weeklyClicks * 0.5) + (likes * 0.3) + (comments * 0.2);
    };


    useEffect(() => {
        fetchPosts();
        fetchListings();
    }, []);

    return (
        <Format content={
            <div className='landing-page'>
                <div className='header-section'>
                    <header className="header-container">
                        <Banner />
                    </header>
                </div>
                <div className='main'>
                    <section>
                        <div className='landing-featured'>
                            <ProductList heading="Featured Products" products={listings} />
                            <ForumList heading="Featured Forum Posts" forums ={posts} descriptionLength={80}  />
                        </div>
                    </section>
                </div>
            </div>
        } />
    );
}

export default LandingPage;