import { useUserStore } from '../../../../lib/userStore';
import './UserInfo.css';

const UserInfo = () => {
    const {currentUser } = useUserStore();

    return (
        <div className='userInfo'>
            <div className='user'>
                <img src={currentUser.profilePic || '/chat-icons/avatar.png'} alt='' />
                <h2>{currentUser.username}</h2>
            </div>
            <div className='icons'>
            </div>
        </div>
    )
};

export default UserInfo;