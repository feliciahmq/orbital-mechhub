import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Auth";
import { FaPoll, FaRegHeart, FaHeart, FaShare } from "react-icons/fa";
import { FaCommentDots } from "react-icons/fa6";
import { doc, getDoc, updateDoc, setDoc, getDocs, addDoc, collection, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';

import './ForumCards.css';

function timeSincePost(postDate) {
    const now = new Date();
    const posted = new Date(postDate);
    const diffInSeconds = Math.floor((now - posted) / 1000);

    if (diffInSeconds < 3600) { 
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) { 
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) { 
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) { 
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 7776000) { 
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months} month${months !== 1 ? 's' : ''} ago`;
    } else {
        return 'More than 3 months ago';
    }
}

function ForumCards({ forumDetail, descriptionLength = 200 }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const { currentUser } = useAuth();
    const [selectedPollOption, setSelectedPollOption] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(forumDetail.likeCount || 0);
    const [commentCount, setCommentCount] = useState(0);

    const fetchUser = useCallback(async () => {
        if (!user) {
            const userDocRef = doc(db, 'Users', forumDetail.userID);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                setUser(userDocSnap.data());
            }
        }
    }, [forumDetail.userID, user]);

    const checkLikeStatus = useCallback(async () => {
        if (currentUser && !isLiked) {
            const likesRef = collection(db, 'Forum', forumDetail.id, 'Likes');
            const q = query(likesRef, where('userID', '==', currentUser.uid));
            const querySnapshot = await getDocs(q);
            setIsLiked(!querySnapshot.empty);
        }
    }, [currentUser, forumDetail.id, isLiked]);

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
            setCommentCount(totalCount);
        }
    
        return fetchedComments;
    };

    useEffect(() => {
        fetchUser();
        checkLikeStatus();
        fetchCommentsRecursively(forumDetail.id);

        if (currentUser) {
            if (currentUser.uid === forumDetail.userID) {
                setShowResults(true);
            } else if (forumDetail.poll && forumDetail.poll.votes) {
                const hasVoted = Object.values(forumDetail.poll.votes).some(
                    voters => voters.includes(currentUser.uid)
                );
                if (hasVoted) {
                    setShowResults(true);
                    setSelectedPollOption(
                        Object.entries(forumDetail.poll.votes).find(
                            ([, voters]) => voters.includes(currentUser.uid)
                        )?.[0]
                    );
                }
            }
        }
    }, [forumDetail, currentUser, fetchUser, checkLikeStatus]);

    const handleViewClick = () => {
        trackClick();
        navigate(`/forumpost/${forumDetail.id}`);
    };

    const handleUsernameClick = (e) => {
        e.stopPropagation();
        navigate(`/profile/${forumDetail.userID}`);
    };

    const handleLike = async (e) => {
        e.stopPropagation();

        if (!currentUser) {
            alert("Please log in to like the forum.");
            return;
        }

        try {
            await addDoc(collection(db, 'Forum', forumDetail.id, 'Likes'), {
                userID: currentUser.uid,
                timestamp: new Date().toISOString()
            });
            setIsLiked(true);
            setLikeCount(prevCount => prevCount + 1);
            const forumRef = doc(db, 'Forum', forumDetail.id);
            await updateDoc(forumRef, {
                likeCount: likeCount + 1
            });

            await addDoc(collection(db, 'Notifications'), {
                recipientID: forumDetail.userID,
                senderID: currentUser.uid,
                listingID: forumDetail.id,
                type: 'forum-like',
                read: false,
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            console.error("Error liking post:", err.message);
        }
    };

    const handleUnlike = async (e) => {
        e.stopPropagation(); 

        try {
            const likesRef = collection(db, 'Forum', forumDetail.id, 'Likes');
            const q = query(likesRef, where('userID', '==', currentUser.uid));
            const querySnapshot = await getDocs(q);
            
            querySnapshot.forEach(async (document) => {
                await deleteDoc(doc(db, 'Forum', forumDetail.id, 'Likes', document.id));
            });

            setIsLiked(false);
            setLikeCount(prevCount => prevCount - 1);

            const forumRef = doc(db, 'Forum', forumDetail.id);
            await updateDoc(forumRef, {
                likeCount: likeCount - 1
            });
        } catch (err) {
            console.error("Error unliking post:", err.message);
        }
    };

    const handlePollVote = async (optionIndex) => {
        if (!currentUser || selectedPollOption !== null) return;

        try {
            const forumDocRef = doc(db, 'Forum', forumDetail.id);
            
            const forumDoc = await getDoc(forumDocRef);
            if (!forumDoc.exists()) {
                console.error("Forum document not found");
                return;
            }

            const currentData = forumDoc.data();
            const currentPoll = currentData.poll || {};
            const currentVotes = currentPoll.votes || {};

            const updatedVotes = { ...currentVotes };
            if (!updatedVotes[optionIndex]) {
                updatedVotes[optionIndex] = [];
            }
            updatedVotes[optionIndex].push(currentUser.uid);

            await updateDoc(forumDocRef, { 
                'poll.votes': updatedVotes 
            });

            setSelectedPollOption(optionIndex);
            setShowResults(true);
        } catch (error) {
            console.error("Error voting in poll:", error);
        }
    };

    const getTotalVotes = () => {
        if (!forumDetail.poll || !forumDetail.poll.votes) return 0;
        return Object.values(forumDetail.poll.votes).reduce((sum, voters) => sum + voters.length, 0);
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    const getWeekStart = () => {
        const now = new Date().toISOString();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        return new Date(now.setDate(diff)).setHours(0, 0, 0, 0); 
    };

    const handleShare = async (e) => {
        e.stopPropagation(); 
        
        const shareUrl = `${window.location.origin}/forumpost/${forumDetail.id}`;
        const shareTitle = forumDetail.title;
        const shareText = "Check out this forum post!";

        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
                console.log("Content shared successfully");
            } catch (err) {
                console.error("Error sharing content:", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                alert("Link copied to clipboard!");
            } catch (err) {
                console.error("Error copying to clipboard:", err);
            }
        }
    };

    const trackClick = async () => {
        if (currentUser.uid !== forumDetail.userID ) {
            const weekStart = getWeekStart();
            const clickCountDoc = doc(db, 'Forum', forumDetail.id, 'clickCount', weekStart.toString());
            const clickCountDocSnapshot = await getDoc(clickCountDoc);

            if (clickCountDocSnapshot.exists()) {
                try {
                    await updateDoc(clickCountDoc, {
                        count: clickCountDocSnapshot.data().count + 1
                    });
                } catch (err) {
                    console.error('Error updating click count: ', err);
                }
            } else {
                try {
                    await setDoc(clickCountDoc, {
                        count: 1,
                    });
                } catch (err) {
                    console.error('Error creating click count: ', err);
                }
            }
        }
    };

    const tagColors = {
        "Questions": "#FF4B2B",  
        "Modding": "#4CAF50",  
        "Reviews": "#2196F3",   
        "Showcase": "#FF9800",  
    };

    return (
        <div className="forum-card" onClick={handleViewClick}>
            <div className="forum-info">
                <div className="forum-profile" onClick={handleUsernameClick}>
                    <img src={user.profilePic} alt={user.username} className="profile-pic" />
                    <span>{user.username}</span>
                </div>
                <span className="forum-date">{timeSincePost(forumDetail.postDate)}</span>
            </div>
            <div className="forum-header">
                <h1>{forumDetail.title}</h1>
                <div className="forum-tags">
                    {forumDetail.tags.map((tag, index) => (
                        <span 
                        key={index} 
                        className="forum-tag"
                        style={{ backgroundColor: tagColors[tag] }}
                      >
                        {tag}
                      </span>
                    ))}
                </div>
            </div>
            {forumDetail.media && forumDetail.media.length > 0 && (
                <div className="forum-media">
                    {forumDetail.media[0].startsWith('data:image') ? (
                        <img src={forumDetail.media[0]} alt="Forum content" />
                    ) : (
                        <video controls>
                            <source src={forumDetail.media[0]} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    )}
                    {forumDetail.media.length > 1 && <span className="media-count">+{forumDetail.media.length - 1}</span>}
                </div>
            )}
            <div className="forum-card-content">
                {forumDetail.description.length > descriptionLength ? (
                    <p>{forumDetail.description.slice(0, descriptionLength)}...</p>
                ) : (
                    <p>{forumDetail.description}</p>
                )}
            </div>
            {!forumDetail.poll.question == "" ? (
                <div className="forum-poll">
                    <div className="poll-title">
                        <FaPoll fill="grey"/>
                        <h3>{forumDetail.poll.question}</h3>
                    </div>
                    {forumDetail.poll.options.map((option, index) => {
                        const voteCount = (forumDetail.poll.votes && forumDetail.poll.votes[index]) ? forumDetail.poll.votes[index].length : 0;
                        const percentage = showResults ? (voteCount / getTotalVotes() * 100).toFixed(1) : 0;
                        return (
                            <div className="poll-option" key={index}>
                                <p>{option}</p>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePollVote(index);
                                    }}
                                    disabled={selectedPollOption !== null}
                                    className={selectedPollOption === index ? 'selected' : ''}
                                >
                                    {showResults && (
                                        <>
                                            <div 
                                                className="poll-results-bar" 
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                            <span className="poll-results-text">
                                                {`${voteCount} votes, ${percentage}%`}
                                            </span>
                                        </>
                                    )}
                                    {!showResults && 'Vote'}
                                </button>
                            </div>
                        );
                    })}
                    {!showResults && !currentUser && (
                        <p className="poll-message">Log in to vote in this poll.</p>
                    )}
                    {!showResults && currentUser && (
                        <p className="poll-message">Vote to see the results.</p>
                    )}
                </div>
            ) : (
                <></>
            )}
            <div className="forum-footer">
                <div className="footer-left">
                    <div className="forum-card-like forum-card-icon">
                        {isLiked ? (
                            <FaHeart onClick={handleUnlike} color="red" /> 
                        ) : (
                            <FaRegHeart onClick={handleLike} fill="grey"/> 
                        )}
                        <span>{likeCount}</span>
                        <span className="tooltip">Like Post</span>
                    </div>
                    <div className="forum-card-comment forum-card-icon">
                        <FaCommentDots fill="grey"/>
                        <span>{commentCount}</span>
                    </div>
                </div>
                <div className="forum-card-share forum-card-icon" onClick={handleShare}>
                    <FaShare fill="grey"/>
                    <span className="tooltip">Share Post</span>
                </div>
            </div>
        </div>
    );
}

export default ForumCards;