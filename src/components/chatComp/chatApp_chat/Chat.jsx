import { useState, useRef, useEffect } from 'react';
import './Chat.css';
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';
import { useChatStore } from '../../../lib/chatStore';
import { useUserStore } from '../../../lib/userStore';
import upload from '../../../lib/upload';
import { formatDistanceToNow, isValid } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
    const [chat, setChat] = useState();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [img, setImg] = useState({
        file: null,
        url: "",
    });
    const [showImg, setShowImg] = useState(false);
    const [imgMsg, setImgMsg] = useState("");

    const { currentUser } = useUserStore();
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const navigate = useNavigate();

    const endRef = useRef(null);

    const scrollToBottom = () => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [chat]);

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "Chats", chatId),(res) => {
            setChat(res.data());
        })

        return () => {
            unSub();
        };
    },[chatId]);

    const handleEmoji = (e) => {
        setText(prev => prev + e.emoji);
        setOpen(false);
    };

    const handleImg = (e) => {
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            });
            setShowImg(true);
        }
    };

    const handleSendText = async () => {
        if (text.trim() === "") return;

        const message = {
            senderId: currentUser.id,
            text: text,
            createdAt: new Date().toString(),
        };

        try {
            await updateDoc(doc(db, "Chats", chatId), {
                messages: arrayUnion(message),
            });
            setText("");
        } catch (err) {
            console.log(err);
        }

        updateChat();
    };

    const handleSendImg = async () => {
        if (!img.file) return;

        let imgUrl = await upload(img.file, chatId);

        const imgMessage = {
            senderId: currentUser.id,
            text: imgMsg,
            createdAt: new Date().toString(),
            img: imgUrl,
        };

        try {
            await updateDoc(doc(db, "Chats", chatId), {
                messages: arrayUnion(imgMessage),
            });
            setImg({
                file: null,
                url: ""
            });
            setImgMsg("");
            setShowImg(false);
        } catch (err) {
            console.log(err);
        }

        updateChat();
    };

    const updateChat = async () => {
        const userIDs = [currentUser.id, user.id];
        userIDs.forEach(async (id) => {
            const userChatsRef = doc(db, "UserChats", id);
            const userChatsSnapshot = await getDoc(userChatsRef);

            if (userChatsSnapshot.exists()) {
                const userChatsData = userChatsSnapshot.data();

                const chatIndex = userChatsData.chats.findIndex(
                    c => c.chatId === chatId
                );

                userChatsData.chats[chatIndex].lastMessage = text;
                userChatsData.chats[chatIndex].isSeen = 
                    id === currentUser.id ? true : false;
                userChatsData.chats[chatIndex].updatedAt = Date.now();

                await updateDoc(userChatsRef, {
                    chats: userChatsData.chats,
                });
            }
        });
    }

    const handleCloseImgPopup = () => {
        setImgMsg("");
        setImg({
            file: null,
            url: "" 
        });
        setShowImg(false); 
    };

    const handleProfileClick = () => {
        navigate(`/profile/${user?.id}`);
    }

    return (
        <div className='chat'>
            <div className="top">
                <div className="user" onClick={handleProfileClick}>
                    <img src={user?.profilePic || "/chat-icons/avatar.png"} alt="" />
                    <div className="texts">
                        <span>{user?.username}</span>
                    </div>
                </div>
            </div>
            <div className="center">
                {chat?.messages?.map((message) => {
                    const parsedDate = new Date(message.createdAt);
                    return (
                        <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createdAt}>
                            <div className="texts">
                                {message.img && <img src={message.img} alt="" />}
                                <p>{message.text}</p>
                                <span>{isValid(parsedDate) ? formatDistanceToNow(parsedDate, { addSuffix: true }) : "Invalid date"}</span>
                            </div>
                        </div>
                    );
                })}
                {img.url && <div className="message own">
                    <div className="texts">
                        <img src={img.url} alt="" />
                    </div>
                </div>}
                <div ref={endRef} />
            </div>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">
                        <img src="/chat-icons/img.png" alt="" />
                    </label>
                    <input type="file" id="file" style={{display:"none"}} onChange={handleImg}/>
                </div>
                <input type="text" 
                    placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You cannot send a message" : "Type a message"}
                    value={text} 
                    onChange={e=>setText(e.target.value)} 
                    disabled={isCurrentUserBlocked || isReceiverBlocked} 
                />
                <div className="emoji">
                    <img src="/chat-icons/emoji.png" 
                        alt="" 
                        onClick={() => !isCurrentUserBlocked && !isReceiverBlocked && setOpen((prev) => !prev)}
                        className={(isCurrentUserBlocked || isReceiverBlocked) ? 'disabled' : ''}
                        />
                    <div className="picker">
                        <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                    </div>
                </div>
                <button className='sendButton' 
                    onClick={handleSendText}
                    disabled={isCurrentUserBlocked || isReceiverBlocked}>
                        Send
                </button>
            </div>
            {showImg && (
                <div className="popup">
                    <div className="pop">
                        <img src={img.url} alt="" />
                        <input
                            placeholder="Add a message to this image."
                            value={imgMsg}
                            onChange={(e) => setImgMsg(e.target.value)}
                        />
                        <button onClick={handleSendImg}>Send Image</button>
                        <button onClick={handleCloseImgPopup}>Close</button>
                    </div>
                </div>
            )}
        </div>
    )
};

export default Chat;