import { arrayUnion, collection, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import "./addUser.css"
import { db } from "../../../../lib/firebaseConfig";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";

const addUser = ({ closePopup }) => {
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
			createdAt: new Date(),
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

    closePopup();
		} catch (err) {
		console.log(err);
		}
	}

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

export default addUser;