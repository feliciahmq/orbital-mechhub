import { useState, useEffect } from 'react';
import './ChatList.css';
import AddUser from '/src/components/chatComp/chatApp_list/addUser/addUser.jsx';
import { useUserStore } from '../../../../lib/userStore';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase/firebaseConfig';

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [addMode, setAddMode] = useState(false);
    const { currentUser } = useUserStore();

    useEffect(() => {
        if (!currentUser || !currentUser.id) {
            console.error("Current user is not defined");
            return;
        }

        const unSub = onSnapshot(doc(db, "UserChats", currentUser.id), async (res) => {
            try {
                const items = res.data()?.chats || [];

                const promises = items.map(async (item) => {
                    const userDocRef = doc(db, "Users", item.receiverId);
                    const userDocSnap = await getDoc(userDocRef);

                    const user = userDocSnap.data();

                    return { ...item, user };
                });

                const chatData = await Promise.all(promises);

                setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
            } catch (error) {
                console.error("Error fetching chat data:", error);
            }
        });

        return () => {
            unSub();
        };
    }, [currentUser]);

    return (
        <div className='chatList'>
            <div className='search'>
                <div className="searchBar">
                    <img src="/src/assets/chat-icons/search.png" alt="" />
                    <input type="text" placeholder='Search ' />
                </div>
                <img src={addMode ? "/src/assets/chat-icons/minus.png" : "/src/assets/chat-icons/plus.png"} alt="" className="add"
                    onClick={() => setAddMode(prev => !prev)} />
            </div>
            {chats.map((chat) => (
                <div className="item" key={chat.chatId}>
                    <img src={chat.user.profilePic || "/src/assets/chat-icons/avatar.png"} alt="" />
                    <div className="texts">
                        <span>{chat.user.username}</span>
                        <p>{chat.lastMessage}</p>
                    </div>
                </div>
            ))}

            {addMode && <AddUser />}
        </div>
    );
};

export default ChatList;
