import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Auth';
import { db } from '../../../lib/firebaseConfig';
import { collection, addDoc, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Format from '../../../components/format/Format';
import './NewForumPost.css';

const saveFormData = (data, shouldSave = true) => {
    if (shouldSave) {
        localStorage.setItem('forumPostFormData', JSON.stringify(data));
    } else {
        localStorage.removeItem('forumPostFormData');
    }
};

const loadFormData = () => {
    const savedData = localStorage.getItem('forumPostFormData');
    return savedData ? JSON.parse(savedData) : null;
};

function NewForumPost() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        media: [],
        description: '',
        postDate: new Date().toISOString(),
        tags: [],
        poll: { question: '', options: [''] }
    });

    const [poll, setPoll] = useState(false);
    const availableTags = ["Questions", "Modding", "Reviews", "Showcase"];

    useEffect(() => {
        const savedData = loadFormData();
        if (savedData) {
            setFormData(savedData);
        }
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            const message = "You have unsaved changes. Are you sure you want to leave?";
            e.returnValue = message;
            return message;
        };

        const handleUnload = () => {
            const shouldSave = window.confirm("Do you want to save your draft?");
            saveFormData(formData, shouldSave);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('unload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleUnload);
        };
    }, [formData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);
        saveFormData(newFormData);
    };

    const handleTagClick = (tag) => {
        const newFormData = {
            ...formData,
            tags: formData.tags.includes(tag)
                ? formData.tags.filter((t) => t !== tag)
                : [...formData.tags, tag]
        };
        setFormData(newFormData);
        saveFormData(newFormData);
    };

    const handlePollOptionChange = (index, value) => {
        const newOptions = [...formData.poll.options];
        newOptions[index] = value;
        const newFormData = { ...formData, poll: { ...formData.poll, options: newOptions } };
        setFormData(newFormData);
        saveFormData(newFormData);
    };

    const addPollOption = () => {
        const newFormData = { ...formData, poll: { ...formData.poll, options: [...formData.poll.options, ''] } };
        setFormData(newFormData);
        saveFormData(newFormData);
    };

    const uploadMedia = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + formData.media.length > 5) {
            toast.error('Maximum 5 media files allowed');
            return;
        }
        const mediaFiles = files.filter(file => file.type.includes('image') || file.type.includes('video'));
        if (mediaFiles.length !== files.length) {
            toast.error('Only images and videos are allowed');
            return;
        }

        const fileReaders = mediaFiles.map(file => {
            return new Promise((resolve, reject) => {
                const fileReader = new FileReader();
                fileReader.onload = (fileReaderEvent) => {
                    resolve(fileReaderEvent.target.result);
                };
                fileReader.onerror = reject;
                fileReader.readAsDataURL(file);
            });
        });

        Promise.all(fileReaders)
            .then(mediaUrls => {
                const newFormData = { ...formData, media: [...formData.media, ...mediaUrls] };
                setFormData(newFormData);
                saveFormData(newFormData);
            })
            .catch(err => {
                toast.error('Failed to read media files');
                console.error(err);
            });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const filteredPollOptions = formData.poll.options.filter(option => option.trim() !== '');
            const dataToSubmit = {
                ...formData,
                poll: { ...formData.poll, options: filteredPollOptions }
            };

            const userDocRef = doc(db, 'Users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                throw new Error('User not found');
            }

            const userData = userDoc.data();
            dataToSubmit.username = userData.username;
            dataToSubmit.userID = currentUser.uid;
            dataToSubmit.postDate = new Date().toISOString();

            const docRef = await addDoc(collection(db, 'Forum'), dataToSubmit);
            const newPostID = docRef.id;

            const followersQuery = query(collection(db, 'Users', currentUser.uid, 'followers'));
            const followersSnap = await getDocs(followersQuery);

            const notifications = followersSnap.docs.map((followerDoc) => {
                const followerData = followerDoc.data();
                if (followerData) {
                    return addDoc(collection(db, 'Notifications'), {
                        recipientID: followerData.followerID,
                        senderID: currentUser.uid,
                        postID: newPostID,
                        type: 'forum',
                        read: false,
                        timestamp: new Date()
                    });
                } else {
                    console.error('Follower document missing userID:', followerDoc.id);
                    return null;
                }
            });

            await Promise.all(notifications.filter(notification => notification !== null));
            toast.success('Forum Post Successfully Created!');
            saveFormData({}, false); 
            setFormData({
                title: '',
                media: [],
                description: '',
                postDate: new Date().toISOString(),
                tags: [],
                poll: { question: '', options: [''] }
            });
            navigate(`/profile/${currentUser.uid}`);
        } catch (err) {
            console.log(err.message);
        }
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

    const togglePoll = () => {
        setPoll(!poll);
        if (!poll) {
            const newFormData = { ...formData, poll: { question: '', options: [''] } };
            setFormData(newFormData);
            saveFormData(newFormData);
        }
    };

    return (
        <Format content={
            <>
                <div className="forum-form">
                    <h2>Create Forum Post</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                        <button className="poll-button" type="button" onClick={togglePoll}>
                            {poll ? "Remove Poll" : "Add Poll"}
                        </button>
                            <label>Title</label>
                            <input 
                                type="text" 
                                name="title" 
                                value={formData.title} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Add Tags</label>
                            <div className="tags-container">
                                {availableTags.map((tag) => (
                                    <button 
                                        type="button" 
                                        key={tag} 
                                        className={`tag-button ${formData.tags.includes(tag) ? 'selected' : ''}`}
                                        onClick={() => handleTagClick(tag)}
                                        data-tag={tag}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Media</label>
                            <div className={`media-upload ${formData.media.length > 0 ? 'has-media' : ''}`}>
                                <input 
                                    className='media-input'
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    onChange={uploadMedia}
                                />
                                {formData.media.length > 0 ? (
                                    <Slider {...settings}>
                                        {formData.media.map((media, index) => (
                                            <div key={index} className="uploaded-media-item">
                                                {media.startsWith('data:image') ? (
                                                    <img src={media} alt={`Uploaded media ${index + 1}`} />
                                                ) : (
                                                    <video controls>
                                                        <source src={media} type="video/mp4" />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                )}
                                            </div>
                                        ))}
                                    </Slider>
                                ) : (
                                    <div className="upload-placeholder">
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Content</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>
                        {poll && (
                            <div className="form-group">
                                <label>Poll Question</label>
                                <input 
                                    type="text" 
                                    name="pollQuestion" 
                                    value={formData.poll.question} 
                                    onChange={(e) => setFormData({ ...formData, poll: { ...formData.poll, question: e.target.value } })} 
                                />
                                <label>Poll Options</label>
                                {formData.poll.options.map((option, index) => (
                                    <input className='poll-option' key={index} type="text" value={option} onChange={(e) => handlePollOptionChange(index, e.target.value)} />
                                ))}
                                <button className="poll-button"type="button" onClick={addPollOption}>Add Option</button>
                            </div>
                        )}
                        <button className="submit" type="submit">Submit</button>
                    </form>
                </div>
            </>
        } />
    );
}

export default NewForumPost;