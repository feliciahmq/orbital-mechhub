import { useState, useRef, useEffect } from 'react';
import './Chat.css';
import EmojiPicker from 'emoji-picker-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';

const Chat = () => {
    const [chat, setChat] = useState();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");

    const endRef = useRef(null);

    useEffect(() => {
        endRef.current.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "Chats", "PLedsuaCLslJ9zHMoMWn"),(res) => {
            setChat(res.data());
        })

        return () => {
            unSub();
        };
    },[]);

    console.log(chat);

    const handleEmoji = (e) => {
        setText(prev => prev + e.emoji);
        setOpen(false);
    };

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
            <div className="message">
                <img src="/src/assets/chat-icons/avatar.png" alt="" />
                <div className="texts">
                    <p>Lorem ipsum, dolor sit amet consectetur adipisicing 
                        elit. Nemo nihil repellat sed, expedita quas aut 
                        ratione dolore ex ipsum consequatur optio provident 
                        iste? Unde explicabo reiciendis, atque blanditiis 
                        optio corrupti?
                    </p>
                    <span>1 min ago</span>
                </div>
            </div>
            <div className="message own">
                <div className="texts">
                    <p>Lorem ipsum, dolor sit amet consectetur adipisicing 
                        elit. Nemo nihil repellat sed, expedita quas aut 
                        ratione dolore ex ipsum consequatur optio provident 
                        iste? Unde explicabo reiciendis, atque blanditiis 
                        optio corrupti?
                    </p>
                    <span>1 min ago</span>
                </div>
            </div>
            <div className="message">
                <img src="/src/assets/chat-icons/avatar.png" alt="" />
                <div className="texts">
                    <p>Lorem ipsum, dolor sit amet consectetur adipisicing 
                        elit. Nemo nihil repellat sed, expedita quas aut 
                        ratione dolore ex ipsum consequatur optio provident 
                        iste? Unde explicabo reiciendis, atque blanditiis 
                        optio corrupti?
                    </p>
                    <span>1 min ago</span>
                </div>
            </div>
            <div className="message own">
                <div className="texts">
                    <p>Lorem ipsum, dolor sit amet consectetur adipisicing 
                        elit. Nemo nihil repellat sed, expedita quas aut 
                        ratione dolore ex ipsum consequatur optio provident 
                        iste? Unde explicabo reiciendis, atque blanditiis 
                        optio corrupti?
                    </p>
                    <span>1 min ago</span>
                </div>
            </div>
            <div className="message">
                <img src="/src/assets/chat-icons/avatar.png" alt="" />
                <div className="texts">
                    <p>Lorem ipsum, dolor sit amet consectetur adipisicing 
                        elit. Nemo nihil repellat sed, expedita quas aut 
                        ratione dolore ex ipsum consequatur optio provident 
                        iste? Unde explicabo reiciendis, atque blanditiis 
                        optio corrupti?
                    </p>
                    <span>1 min ago</span>
                </div>
            </div>
            <div className="message own">
                <div className="texts">
                    <img src="https://images.unsplash.com/photo-1575936123452-b67c3203c357?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
                    <p>Lorem ipsum, dolor sit amet consectetur adipisicing 
                        elit. Nemo nihil repellat sed, expedita quas aut 
                        ratione dolore ex ipsum consequatur optio provident 
                        iste? Unde explicabo reiciendis, atque blanditiis 
                        optio corrupti?
                    </p>
                    <span>1 min ago</span>
                </div>
            </div>
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
            <button className='sendButton'>Send</button>
        </div>
    </div>
  )
};

export default Chat;