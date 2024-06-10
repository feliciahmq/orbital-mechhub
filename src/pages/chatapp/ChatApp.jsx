import './ChatApp.css';

import Chat from "../../components/chatApp_chat/Chat";
import Detail from "../../components/chatApp_detail/Detail";
import List from "../../components/chatApp_list/List";

const ChatApp = () => {
  return (
    <div className='chat-page'>
        <div className='chat-container'>
          <div className='inner-container'>
            <List/>
            <Chat/>
            <Detail/>
          </div>
        </div>
    </div>
  )
}

export default ChatApp;