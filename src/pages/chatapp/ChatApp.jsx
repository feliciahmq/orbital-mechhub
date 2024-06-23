import './ChatApp.css';

import Chat from "../../components/chatApp_chat/Chat";
import Detail from "../../components/chatApp_detail/Detail";
import List from "../../components/chatApp_list/List";
import Header from "../../components/header/Header";
import LoginSignupForm from "../../pages/registration/LoginSignupForm.jsx";

const ChatApp = () => {

  const user = false;

  return (
    <div className='chat-page'>
      {
        user ? ( 
          <>
            <Header className='chat-header'/>
              <div className='chat-container'>
                <div className='inner-container'>
                  <List/>
                  <Chat/>
                  <Detail/>
                </div>
              </div>
          </> 
        ) : (<LoginSignupForm/>)
      }
    </div>
  )
}

export default ChatApp;