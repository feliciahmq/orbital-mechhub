import { useState, useEffect } from 'react';
import './ChatList.css';
import AddUser from '/src/components/chatComp/chatApp_list/addUser/addUser.jsx';
import { useUserStore } from '../../../../lib/userStore';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebaseConfig';
import { useChatStore } from '../../../../lib/chatStore';

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [addMode, setAddMode] = useState(false);
    const { currentUser } = useUserStore();
    const { changeChat } = useChatStore();

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

    const handleSelect = async (chat) => {

        const userChats = chats.map((item) => {
            const { user, ...rest } = item;
            return rest;
        });

        const chatIndex = userChats.findIndex(item => item.chatId === chat.chatId);
        userChats[chatIndex].isSeen = true;

        const userChatsRef = doc(db, "UserChats", currentUser.id);

        try {
            await updateDoc(userChatsRef, {
                chats: userChats,
            })
            changeChat(chat.chatId, chat.user);
            
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className='chatList'>
            <div className='search'>
                <div className="searchBar">
                    <img src="/src/assets/chat-icons/search.png" alt="" />
                    <input type="text" placeholder='Search ' />
                </div>
                <img src={addMode ? "/src/assets/chat-icons/minus.png" : "/src/assets/chat-icons/plus.png"} alt="" className="add"
                    onClick={() => setAddMode((prev) => !prev)} />
            </div>
            {chats.map((chat) => (
                <div className="item" key={chat.chatId} 
                    onClick={() => handleSelect(chat)}
                    style= {{
                        backgroundColor: chat?.isSeen ? "transparent" : "#5083FE",
                    }}>
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
