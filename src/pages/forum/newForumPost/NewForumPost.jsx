import React, { useState } from "react";
import { useAuth } from "../../../Auth";
import Format from '../../../components/format/Format';
import './NewForumPost.css';

function NewForumPost() {
    const currentUser = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        media: [], 
        description: '',
        postDate: new Date().toISOString(),
        tags: [],
        poll: { question: '', options: [''] }
    });

    const [poll, setPoll] = useState(0);

    const availableTags = ["Questions", "Modding", "Reviews", "Showcase"];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData({ ...formData, media: files });
    };

    const handleTagClick = (tag) => {
        setFormData((prevFormData) => {
            const tags = prevFormData.tags.includes(tag)
                ? prevFormData.tags.filter((t) => t !== tag)
                : [...prevFormData.tags, tag];
            return { ...prevFormData, tags };
        });
    };

    const handlePollOptionChange = (index, value) => {
        const newOptions = [...formData.poll.options];
        newOptions[index] = value;
        setFormData({ ...formData, poll: { ...formData.poll, options: newOptions } });
    };

    const addPollOption = () => {
        setFormData({ ...formData, poll: { ...formData.poll, options: [...formData.poll.options, ''] } });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userDocRef = doc(db, 'Users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                throw new Error('User not found');
            }

            const userData = userDoc.data();
            let dataToSubmit = {
                ...formData,
                username: userData.username,
                userID: currentUser.uid
            };

            dataToSubmit = {
                ...dataToSubmit,
                postDate: new Date().toISOString()
            };
            const docRef = await addDoc(collection(db, 'Forum'), dataToSubmit);
            const newListingID = docRef.id;

            const followersQuery = query(collection(db, 'Users', currentUser.uid, 'followers'));
            const followersSnap = await getDocs(followersQuery);

            const notifications = followersSnap.docs.map((followerDoc) => {
                const followerData = followerDoc.data();
                if (followerData) {
                    return addDoc(collection(db, 'Notifications'), {
                        recipientID: followerData.followerID,
                        senderID: currentUser.uid,
                        listingID: newListingID,
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
            toast.success('Listing Successfully Created!');
        } catch (err) {
            console.log(err.message);
        }
    };

    return (
        <Format content={
            <>
                <div className="forum-form">
                    <h2>Create Forum Post</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
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
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Media</label>
                            <input 
                                type="file" 
                                accept="image/*,video/*" 
                                multiple 
                                onChange={handleMediaChange} 
                            />
                        </div>
                        <div className="form-group">
                            <label>Text</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>
                        
                       
                            {poll > 0 ? (
                                <div>
                                    <label>Poll Question</label>
                                    <input 
                                        type="text" 
                                        name="pollQuestion" 
                                        value={formData.poll.question} 
                                        onChange={(e) => setFormData({ ...formData, poll: { ...formData.poll, question: e.target.value } })} 
                                    />
                                    <label>Poll Options</label>
                                    {formData.poll.options.map((option, index) => (
                                        <input key={index} type="text" value={option} onChange={(e) => handlePollOptionChange(index, e.target.value)} />
                                    ))}
                                    <button type="button" onClick={addPollOption}>Add Option</button>
                                </div>
                            ) : (
                                <></>
                            )}
                        <button className="submit" type="submit">Submit</button>
                    </form>
                </div>
            </>
        } />
    );
}

export default NewForumPost;