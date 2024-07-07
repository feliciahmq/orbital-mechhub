import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth';
import { db } from '../../lib/firebaseConfig';
import { FaRegHeart, FaHeart, FaStar, FaStarHalf, FaShare } from "react-icons/fa";
import { FaCommentDots } from "react-icons/fa6";
import { doc, getDoc, addDoc, collection, deleteDoc, query, where, getDocs, updateDoc, setDoc } from 'firebase/firestore';

import Format from '../../components/format/Format';
import './ForumPost.css';

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

function ForumPostPage() {
    const { currentUser } = useAuth();
    const { postID } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [user, setUser] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [selectedPollOption, setSelectedPollOption] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            const postDoc = await getDoc(doc(db, 'Forum', postID));

            if (postDoc.exists()) {
                const postData = postDoc.data();
                setPost(postData);

                const userDocRef = doc(db, 'Users', postData.userID);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUser(userDocSnap.data());
                }
            } else {
                console.log('There is no such post');
            }
        }

        const fetchComments = async () => {
            const commentsQuery = query(collection(db, 'Forum', postID, 'Comments'));
            const commentsSnapshot = await getDocs(commentsQuery);
            const commentsData = commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setComments(commentsData);
        };

        const checkIfLiked = async () => {
            if (currentUser) {
                const likesQuery = query(
                    collection(db, 'Forum', postID, 'Likes'),
                    where('userID', '==', currentUser.uid)
                );
                const likesSnapshot = await getDocs(likesQuery);
                if (!likesSnapshot.empty) {
                    setIsLiked(true);
                }
            }
        };

        const getLikeCount = async () => {
            const likesSnapshot = await getDocs(collection(db, 'Forum', postID, 'Likes'));
            setLikeCount(likesSnapshot.size);
        };

        fetchPost();
        checkIfLiked();
        getLikeCount();
        fetchComments();
    }, [postID, currentUser]);

    const handleComment = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert('Please log in to comment.');
            return;
        }
        if (newComment.trim() === '') return;

        const commentData = {
            content: newComment,
            userId: currentUser.uid,
            timestamp: new Date()
        };

        if (replyingTo) {
            await addDoc(collection(db, 'Forum', postID, 'Comments', replyingTo, 'Replies'), commentData);
        } else {
            await addDoc(collection(db, 'Forum', postID, 'Comments'), commentData);
        }

        setNewComment('');
        setReplyingTo(null);
        const commentsQuery = query(collection(db, 'Forum', postID, 'Comments'));
        const commentsSnapshot = await getDocs(commentsQuery);
        const commentsData = commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setComments(commentsData);
    };

    const handleLike = async (e) => {
        e.stopPropagation();

        if (!currentUser) {
            alert("Please log in to like the forum.");
            return;
        }

        try {
            await addDoc(collection(db, 'Forum', postID, 'Likes'), {
                userID: currentUser.uid,
                timestamp: new Date()
            });
            setIsLiked(true);
            setLikeCount(prevCount => prevCount + 1);

            await addDoc(collection(db, 'Notifications'), {
                recipientID: post.userID,
                senderID: currentUser.uid,
                listingID: postID,
                type: 'forum-like',
                read: false,
                timestamp: new Date()
            });
        } catch (err) {
            console.error("Error liking post:", err.message);
        }
    };

    const handleUnlike = async (e) => {
        e.stopPropagation(); 

        try {
            const likesRef = collection(db, 'Forum', postID, 'Likes');
            const q = query(likesRef, where('userID', '==', currentUser.uid));
            const querySnapshot = await getDocs(q);
            
            querySnapshot.forEach(async (document) => {
                await deleteDoc(doc(db, 'Forum', postID, 'Likes', document.id));
            });

            setIsLiked(false);
            setLikeCount(prevCount => prevCount - 1);
        } catch (err) {
            console.error("Error unliking post:", err.message);
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        });
    };

    const handlePollVote = async (optionIndex) => {
        if (!currentUser || selectedPollOption !== null) return;

        try {
            const forumDocRef = doc(db, 'Forum', postID);
            
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
        if (!post.poll || !post.poll.votes) return 0;
        return Object.values(post.poll.votes).reduce((sum, voters) => sum + voters.length, 0);
    };

    const handleUsernameClick = () => {
        navigate(`/profile/${post.userID}`);
    };

    if (!post || !user) {
        return <div>Loading...</div>;
    }

    const tagColors = {
        "Questions": "#FF4B2B",  
        "Modding": "#4CAF50",  
        "Reviews": "#2196F3",   
        "Showcase": "#FF9800",  
    };

    return (
        <Format content={
            <div className='forum-post'>
                {user && (
                    <div className='forum-user-container'>
                        <div className='user-details'>
                            <img className='userpic'
                                src={user.profilePic}
                                alt={user.username}
                                onClick={handleUsernameClick}
                            />
                            <h4 onClick={handleUsernameClick}>{user.username}</h4>
                        </div>
                    </div>
                )}
                <div className="forum-header">
                    <h1>{post.title}</h1>
                    <div className="forum-tags">
                        {post.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="forum-tag"
                                style={{ backgroundColor: tagColors[tag] || '#000' }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                <div className='forum-stats'>
                    <p>{timeSincePost(post.postDate)}</p>
                </div>
                {post.media && (
                    <div className='forum-media'>
                        {post.media.map((mediaItem, index) => (
                            <img key={index} src={mediaItem.url} alt={`media-${index}`} />
                        ))}
                    </div>
                )}
                <div className='forum-content'>
                    <p>{post.content}</p>
                </div>
                {post.poll && (
                    <div className='poll'>
                        <h3>{post.poll.question}</h3>
                        {post.poll.options.map((option, index) => (
                            <div key={index} onClick={() => handlePollVote(index)}>
                                {option}
                                {showResults && (
                                    <span>
                                        {((post.poll.votes[index]?.length || 0) / getTotalVotes() * 100).toFixed(2)}%
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <div className="forum-post-actions">
                    <div className="like-button" onClick={isLiked ? handleUnlike : handleLike}>
                        {isLiked ? (
                            <FaHeart onClick={handleUnlike} color="red" /> 
                        ) : (
                            <FaRegHeart onClick={handleLike} fill="grey"/> 
                        )}
                        <span>{likeCount}</span>
                    </div>
                    <div>
                        <FaCommentDots fill="grey"/>
                    </div>
                    <div className="share-button" onClick={handleShare}>
                        <FaShare />
                    </div>
                </div>
                <div className='forum-comments'>
                    <h3>Comments</h3>
                    <form onSubmit={handleComment}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                        />
                        <button type="submit">Comment</button>
                    </form>
                    <div className='comments-list'>
                        {comments.map(comment => (
                            <div key={comment.id} className='comment'>
                                <div className='comment-content'>
                                    <p>{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        } />
    );
}

export default ForumPostPage;