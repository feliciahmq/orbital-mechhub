import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import "./addUser.css"
import { db } from "../../../../lib/firebaseConfig";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddUser = ({ closePopup }) => {
	const [user, setUser] = useState(null);
	const [error, setError] = useState("");
	const { currentUser } = useUserStore();
	const navigate = useNavigate();

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
			const currentUserChatsDoc = await getDoc(doc(userChatsRef, currentUser.id)); 
			const existingChats = currentUserChatsDoc.exists() && currentUserChatsDoc.data().chats ? currentUserChatsDoc.data().chats : [];
			const existingChat = existingChats.find( chat => chat.receiverId === user.id ); 

			if (existingChat) { 
				toast.error("A chat with this user already exists.");
				navigate(`/chat/${currentUser.id}/${existingChat.id}`);
				return; 
      } 

			const newChatRef = await addDoc(chatRef, {
				createdAt: new Date(),
				messages: [],
			});
	
			if (!newChatRef.id) {
                throw new Error("Failed to create new chat");
            }

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

      closePopup();
			navigate(`/chat/${currentUser.id}/${newChatRef.id}`);

		} catch (err) {
      console.log(err);
		}
	};

	return (
		<div className="addUser">
			<div className="closeButton" onClick={closePopup}> 
				<img src="/chat-icons/cross.png" alt="" />
			</div>
			<form onSubmit={handleSearch}>
				<input type="text" placeholder="Username" name="username" />
				<button type="submit">Search</button>
			</form>
			{user ? (
			<div className="user">
			<div className="detail">
				<img src={user.profilePic || "/chat-icons/avatar.png"} alt="" />
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

export default AddUser;