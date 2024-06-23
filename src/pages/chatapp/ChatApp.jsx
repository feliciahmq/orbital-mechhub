import './ChatApp.css';

import Chat from "../../components/chatComp/chatApp_chat/Chat.jsx";
import Detail from "../../components/chatComp/chatApp_detail/Detail.jsx";
import List from "../../components/chatComp/chatApp_list/List.jsx";
import Header from "../../components/header/Header";
import LoginSignupForm from "../../pages/registration/LoginSignupForm.jsx";

const ChatApp = () => {

  const user = true;

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
  );
};

export default ChatApp;