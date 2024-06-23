import "./addUser.css"

const addUser = () => {
  return (
    <div className="addUser">
        <form>
            <input type="text" placeholder="Username" name="username " />
            <button>Search</button>
        </form>
        <div className="user">
            <div className="detail">
                <img src="src/assets/chat-icons/avatar.png" alt="" />
                <span>Vanessa Lai</span>
            </div>
            <button>Add User</button>
        </div>
    </div>
  );
};

export default addUser