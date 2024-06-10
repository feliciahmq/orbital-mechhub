import { useState } from 'react';
import './ChatList.css';

const ChatList = () => {
    const [addMode, setAddMode] = useState(false);

    return (
        <div className='chatList'>
            <div className='search'>
                <div className="searchBar">
                    <img src="../../search.png" alt="" />
                    <input type="text" placeholder='Search '/>
                </div>
                <img src={addMode ? "../../minus.png" : "../../plus.png"} alt="" className="add" 
                onClick={() => setAddMode(prev=>!prev)}/>
            </div>
            <div className="item">
                <img src="../../avatar.png" alt="" />
                <div className="texts">
                    <span>Vanessa Lai</span>
                    <p>Hello world</p>
                </div>
            </div>
            <div className="item">
                <img src="../../avatar.png" alt="" />
                <div className="texts">
                    <span>Vanessa Lai</span>
                    <p>Hello world</p>
                </div>
            </div>
            <div className="item">
                <img src="../../avatar.png" alt="" />
                <div className="texts">
                    <span>Vanessa Lai</span>
                    <p>Hello world</p>
                </div>
            </div>
            <div className="item">
                <img src="../../avatar.png" alt="" />
                <div className="texts">
                    <span>Vanessa Lai</span>
                    <p>Hello world</p>
                </div>
            </div>
            <div className="item">
                <img src="../../avatar.png" alt="" />
                <div className="texts">
                    <span>Vanessa Lai</span>
                    <p>Hello world</p>
                </div>
            </div>
            <div className="item">
                <img src="../../avatar.png" alt="" />
                <div className="texts">
                    <span>Vanessa Lai</span>
                    <p>Hello world</p>
                </div>
            </div>
        </div>
    )
};

export default ChatList