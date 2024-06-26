import React, { useEffect, useState } from 'react';
import { arrayRemove, arrayUnion, doc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useChatStore } from '../../../lib/chatStore';
import { useUserStore } from '../../../lib/userStore';
import { db } from '../../../lib/firebaseConfig';
import './Detail.css';

const Detail = () => {
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
    const { currentUser } = useUserStore();
    const [photos, setPhotos] = useState([]);
    const [showPhotos, setShowPhotos] = useState(false);
    const [icon, setIcon] = useState("/chat-icons/arrowDown.png");

    useEffect(() => {
        if (!chatId) return;

        const photosRef = collection(db, 'photos');
        const q = query(photosRef, where('chatId', '==', chatId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const photosData = [];
        querySnapshot.forEach((doc) => {
            photosData.push({ id: doc.id, ...doc.data() });
        });
        setPhotos(photosData);
        });

        return () => unsubscribe();
    }, [chatId]);

    const handleBlock = async () => {
        if (!user) return;

        const userDocRef = doc(db, "Users", currentUser.id);

        try {
            await updateDoc(userDocRef, {
                blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
            });
            changeBlock();
        } catch (err) {
            console.log(err);
        }
    }

    const toggleShowPhotos = () => {
        setShowPhotos(!showPhotos);
        setIcon(showPhotos ? "/chat-icons/arrowDown.png" : "/chat-icons/arrowUp.png");
    };

    return (
        <div className='detail'>
        <div className="user">
            <img src={user?.profilePic || "/chat-icons/avatar.png"} alt="" />
            <h2>{user?.username}</h2>
        </div>
        <div className="info">
            <div className="option">
            <div className="setting">
                <span>Shared Photos</span>
                <button onClick={toggleShowPhotos} style={{ background: 'none', border: 'none', padding: 0 }}>
                <img src={icon} alt="" />
                </button>
            </div>
            {showPhotos && (
                <div className="photos">
                {photos.map((photo) => (
                    <div className="photoItem" key={photo.id}>
                    <div className="photoDetail">
                        <img src={photo.url} alt="" />
                        <span>{photo.id}</span>
                    </div>
                    <a href={photo.url} target="_blank">
                        <img src="/chat-icons/download.png" alt="Download" className='icon'/>
                    </a>
                    </div>
                ))}
                </div>
            )}
            </div>
            <span></span>
            <button onClick={handleBlock}>{
            isCurrentUserBlocked 
            ? "You are blocked" 
            : isReceiverBlocked 
            ? "Unblock user" 
            : "Block user" 
            }</button>
        </div>
        </div>
    )
};

export default Detail;
