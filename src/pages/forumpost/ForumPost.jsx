import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth';
import { db } from '../../lib/firebaseConfig';
import { FaRegHeart, FaHeart, FaStar, FaStarHalf, FaShare, FaPoll } from "react-icons/fa";
import { FaCommentDots } from "react-icons/fa6";
import { doc, getDoc, addDoc, collection, deleteDoc, query, where, getDocs, updateDoc, setDoc } from 'firebase/firestore';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        centerMode: true,
        centerPadding: '0',
    };

    return (
        <Format content={
            <div className='forum-post-page'>
                <div className='forum-post'>
                    {user && (
                        <div className='forum-user-container'>
                            <div className='forum-user-details'>
                                <img className='userpic'
                                    src={user.profilePic}
                                    alt={user.username}
                                    onClick={handleUsernameClick}
                                />
                                <h4 onClick={handleUsernameClick}>{user.username}</h4>
                            </div>
                            <p>{timeSincePost(post.postDate)}</p>
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
                    {post.media && post.media.length > 0 ? (
                        <div className='forum-media'>
                            <Slider {...settings}>
                                {post.media.map((media, index) => (
                                    <div key={index} className='post-media'>
                                        {media.startsWith('data:image') || media.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                            <img src={media} alt={`media-${index}`} />
                                        ) : (
                                            <video controls>
                                                <source src={media} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        )}
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    ) : (
                        <></>
                    )}
                    <div className='forum-content'>
                        <p style={{ wordBreak: 'break-word' }}>{post.description}</p>
                    </div>
                    {!post.poll.question == "" ? (
                    <div className="forum-poll">
                        <div className="poll-title">
                            <FaPoll fill="grey"/>
                            <h3>{post.poll.question}</h3>
                        </div>
                        {post.poll.options.map((option, index) => {
                            const voteCount = (post.poll.votes && post.poll.votes[index]) ? post.poll.votes[index].length : 0;
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
                            </div>
                        </div>
                        <div className="forum-card-share forum-card-icon" onClick={handleShare}>
                            <FaShare fill="grey"/>
                            <span className="tooltip">Share Post</span>
                        </div>
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