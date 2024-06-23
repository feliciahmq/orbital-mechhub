import { useState } from 'react';
import './ChatList.css';
import AddUser from '/src/components/chatComp/chatApp_list/addUser/addUser.jsx';

const ChatList = () => {
    const [addMode, setAddMode] = useState(false);

    return (
        <div className='chatList'>
            <div className='search'>
                <div className="searchBar">
                    <img src="/src/assets/chat-icons/search.png" alt="" />
                    <input type="text" placeholder='Search '/>
                </div>
                <img src={addMode ? "src/assets/chat-icons/minus.png" : "src/assets/chat-icons/plus.png"} alt="" className="add" 
                onClick={() => setAddMode(prev=>!prev)}/>
            </div>
            <div className="item">
                <img src="/src/assets/chat-icons/avatar.png" alt="" />
                <div className="texts">
                    <span>Vanessa Lai</span>
                    <p>Hello world</p>
                </div>
            </div>
            <div className="item">
                <img src="/src/assets/chat-icons/avatar.png" alt="" />
                <div className="texts">
                    <span>Vanessa Lai</span>
                    <p>Hello world</p>
                </div>
            </div>
            <div className="item">
                <img src="/src/assets/chat-icons/avatar.png" alt="" />
                <div className="texts">
                    <span>Vanessa Lai</span>
                    <p>Hello world</p>
                </div>
            </div>
            <div className="item">
                <img src="/src/assets/chat-icons/avatar.png" alt="" />
                <div className="texts">
                    <span>Vanessa Lai</span>
                    <p>Hello world</p>
                </div>
            </div>
            <div className="item">
                <img src="/src/assets/chat-icons/avatar.png" alt="" />
                <div className="texts">
                    <span>Vanessa Lai</span>
                    <p>Hello world</p>
                </div>
            </div>
            <div className="item">
                <img src="/src/assets/chat-icons/avatar.png" alt="" />
                <div className="texts">
                    <span>Vanessa Lai</span>
                    <p>Hello world</p>
                </div>
            </div>
            {addMode && <AddUser />}
        </div>
    )
};

export default ChatList;