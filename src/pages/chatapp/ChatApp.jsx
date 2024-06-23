import './ChatApp.css';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from "/src/lib/firebaseConfig";
import { useUserStore } from '../../lib/userStore.js';
import { useNavigate } from 'react-router-dom';

import Chat from "../../components/chatComp/chatApp_chat/Chat.jsx";
import Detail from "../../components/chatComp/chatApp_detail/Detail.jsx";
import List from "../../components/chatComp/chatApp_list/List.jsx";
import Header from "../../components/header/Header";
import LoginSignupForm from "../../pages/registration/LoginSignupForm.jsx";

const ChatApp = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserInfo(user.uid);
      } else {
        fetchUserInfo(null);
      }
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  console.log(currentUser);

  if (isLoading) {
    // return <LoadingPage />;
    return <div className='loading'>Loading...</div>
  }

  return (
    <div className='chat-page'>
      {currentUser ? ( 
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
        ) : (
        <LoginSignupForm />
      )}
    </div>
  );
};

export default ChatApp;
