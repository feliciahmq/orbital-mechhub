import './UserInfo.css';

const UserInfo = () => {
  return (
    <div className='userInfo'>
        <div className='user'>
            <img src='src/assets/chat-icons/avatar.png' alt='' />
            <h2>Felicia</h2>
        </div>
        <div className='icons'>
            <img src='src/assets/chat-icons/more.png' alt='' />
            <img src='src/assets/chat-icons/video.png' alt='' />
            <img src='src/assets/chat-icons/edit.png' alt='' />
        </div>
    </div>
  )
};

export default UserInfo;