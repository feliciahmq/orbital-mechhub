import './Detail.css';

const Detail = () => {
  return (
    <div className='detail'>
      <div className="user">
        <img src="src/assets/chat-icons/avatar.png" alt="" />
        <h2>Vanessa Lai</h2>
        <p>Lorem ipsum dolor sit amet.</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="setting">
            <span>Chat Settings</span>
            <img src="src/assets/chat-icons/arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="setting">
            <span>Privacy & Help</span>
            <img src="src/assets/chat-icons/arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="setting">
            <span>Shared Photos</span>
            <img src="src/assets/chat-icons/arrowDown.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://plus.unsplash.com/premium_photo-1718235358876-ed7d63466e11?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
                <span>photo_2024_2.png</span>
              </div>
              <img src="src/assets/chat-icons/download.png" alt="" className='icon' />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://plus.unsplash.com/premium_photo-1718235358876-ed7d63466e11?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
                <span>photo_2024_2.png</span>
              </div>
              <img src="src/assets/chat-icons/download.png" alt="" className='icon' />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="setting">
            <span>Shared Files</span>
            <img src="src/assets/chat-icons/arrowUp.png" alt="" />
          </div>
        </div>
        <button>Block User</button>
      </div>
    </div>
  )
};

export default Detail;