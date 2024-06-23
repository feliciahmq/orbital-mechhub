import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import "./addUser.css"
import { db } from "../../../../firebase/firebaseConfig";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";

const addUser = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const { currentUser } = useUserStore();

  const handleSearch = async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username"); 

    try {
      const userRef = collection(db, "Users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
        setError("");
      } else {
        setUser(null); 
        setError("User not found.");
      }
    } catch (err) {
      console.log(err);
      setUser(null); 
      setError("User not found.");
    }
  };

  const handleAdd = async () => {
    
    const chatRef = collection(db, "Chats");
    const userChatsRef = collection(db, "UserChats");

    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages:[],
      });

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });

    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="addUser">
        <form onSubmit={handleSearch}>
            <input type="text" placeholder="Username" name="username" />
            <button>Search</button>
        </form>
        {user ? (
        <div className="user">
          <div className="detail">
            <img src={user.profilePic || "/src/assets/chat-icons/avatar.png"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      ) : (
        error && 
        <div className="error">
          {error}
        </div>
      )}
    </div>
  );
};

export default addUser;