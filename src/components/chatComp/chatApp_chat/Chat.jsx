import { useState, useRef, useEffect } from 'react';
import './Chat.css';
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';
import { useChatStore } from '../../../lib/chatStore';
import { useUserStore } from '../../../lib/userStore';
import upload from '../../../lib/upload';

const Chat = () => {
    const [chat, setChat] = useState();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [img, setImg] = useState({
        file: null,
        url: "",
    });

    const { currentUser } = useUserStore();
    const { chatId, user } = useChatStore();

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
        }
    };

    const handleSend = async () => {
        if (text === "") return;

        let imgUrl = null;

        try {
            if (img.file) {
                imgUrl = await upload(img.file);
            }

            await updateDoc(doc(db, "Chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                    ...(imgUrl && { img: imgUrl }),
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
            });
        } catch (err) {
            console.log(err);
        }

        setImg({
            file: null,
            url: ""
        });

        setText("");
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
                    <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createdAt}>
                    <div className="texts">
                        {message.img && <img 
                            src={message.img} 
                            alt="" 
                        />}
                        <p>{message.text}</p>
                        {/* <span>{message.createdAt}</span> */}
                    </div>
                </div>
                ))}
                {img.url && <div className="message own">
                    <div className="texts">
                        <img src={img.url} alt="" />
                    </div>
                </div>}
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">
                        <img src="/src/assets/chat-icons/img.png" alt="" />
                    </label>
                    <input type="file" id="file" style={{display:"none"}} onChange={handleImg}/>
                    <img src="/src/assets/chat-icons/camera.png" alt="" />
                    <img src="/src/assets/chat-icons/mic.png" alt="" />
                </div>
                <input type="text" 
                    placeholder='Type a message' 
                    value={text} 
                    onChange={e=>setText(e.target.value)} />
                <div className="emoji">
                    <img src="/src/assets/chat-icons/emoji.png" 
                        alt="" 
                        onClick={() => setOpen((prev) => !prev)} />
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