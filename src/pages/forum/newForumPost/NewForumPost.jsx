import React, { useState } from "react";
import { useAuth } from "../../../Auth";

import Header from "../../../components/header/Header";
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData({ ...formData, media: files });
    };

    const handleTagsChange = (e) => {
        const selectedTags = Array.from(e.target.selectedOptions, option => option.value);
        setFormData({ ...formData, tags: selectedTags });
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
        <>
            <Header />
            <div className="new-forum-post">
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <label>Media</label>
                        <input type="file" accept="image/*,video/*" multiple onChange={handleMediaChange} />
                    </div>
                    <div>
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <label>Tags</label>
                        <select multiple name="tags" value={formData.tags} onChange={handleTagsChange}>
                            <option value="mechanical">Mechanical</option>
                            <option value="keycaps">Keycaps</option>
                            <option value="switches">Switches</option>
                            <option value="modding">Modding</option>
                            <option value="reviews">Reviews</option>
                        </select>
                    </div>
                    <div>
                        <label>Poll Question</label>
                        <input type="text" name="pollQuestion" value={formData.poll.question} onChange={(e) => setFormData({ ...formData, poll: { ...formData.poll, question: e.target.value } })} />
                        <label>Poll Options</label>
                        {formData.poll.options.map((option, index) => (
                            <input key={index} type="text" value={option} onChange={(e) => handlePollOptionChange(index, e.target.value)} />
                        ))}
                        <button type="button" onClick={addPollOption}>Add Option</button>
                    </div>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </>
    );
}

export default NewForumPost;