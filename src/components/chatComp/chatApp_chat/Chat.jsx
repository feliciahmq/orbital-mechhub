import { useState, useRef, useEffect } from 'react';
import './Chat.css';
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';
import { useChatStore } from '../../../lib/chatStore';
import { useUserStore } from '../../../lib/userStore';

const Chat = () => {
    const [chat, setChat] = useState();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");

    const { currentUser } = useUserStore();
    const { chatId, user } = useChatStore();

    const endRef = useRef(null);

    const scrollToBottom = () => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "Chats", chatId),(res) => {
            setChat(res.data());
        })

        return () => {
            unSub();
        };
    },[chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [chat]);

    const handleEmoji = (e) => {
        setText(prev => prev + e.emoji);
        setOpen(false);
    };

    const handleSend = async () => {
        if (text === "") return;

        try {
            await updateDoc(doc(db, "Chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                }),
            });

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
            })

            setText("");

        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className='chat'>
            <div className="top">
                <div className="user">
                    <img src="/src/assets/chat-icons/avatar.png" alt="" />
                    <div className="texts">
                        <span>Vanessa Lai</span>
                        <p>Lorem ipsum dolar, sit amet.</p>
                    </div>
                </div>
                <div className="icons">
                    <img src="/src/assets/chat-icons/phone.png" alt="" />
                    <img src="/src/assets/chat-icons/video.png" alt="" />
                    <img src="/src/assets/chat-icons/info.png" alt="" />
                </div>
            </div>
            <div className="center">
                {chat?.messages?.map((message) => (
                    <div className="message own" key={message?.createdAt}>
                    <div className="texts">
                        {message.img && <img 
                            src={message.img} 
                            alt="" 
                        />}
                        <p>
                            {message.text}
                        </p>
                        {/* <span>{message.createdAt}</span> */}
                    </div>
                </div>
                ))}
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <img src="/src/assets/chat-icons/img.png" alt="" />
                    <img src="/src/assets/chat-icons/camera.png" alt="" />
                    <img src="/src/assets/chat-icons/mic.png" alt="" />
                </div>
                <input type="text" placeholder='Type a message...' 
                    value={text} onChange={e=>setText(e.target.value)} />
                <div className="emoji">
                    <img src="/src/assets/chat-icons/emoji.png" alt="" onClick={() => setOpen((prev) => !prev)} />
                    <div className="picker">
                        <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                    </div>
                </div>
                <button className='sendButton' onClick={handleSend}>Send</button>
            </div>
        </div>
    )
};

export default Chat;