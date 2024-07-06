import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Auth";
import { FaPoll } from "react-icons/fa";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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

function ForumCards({ forumDetail }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const { currentUser } = useAuth();
    const [selectedPollOption, setSelectedPollOption] = useState(null);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const userDocRef = doc(db, 'Users', forumDetail.userID);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                setUser(userDocSnap.data());
            }
        };

        fetchUser();

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
    }, [forumDetail.userID, forumDetail.poll, currentUser]);

    const handleViewClick = () => {
        navigate(`/forum/${forumDetail.id}`);
    };

    const handleUsernameClick = (e) => {
        e.stopPropagation();
        navigate(`/profile/${forumDetail.userID}`);
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
                <h2>{forumDetail.title}</h2>
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
            <div className="forum-content">
                {forumDetail.description.length > 200 ? (
                    <p>{forumDetail.description.slice(0, 200)}...</p>
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
        </div>
    );
}
export default ForumCards;