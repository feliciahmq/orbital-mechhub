import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../../lib/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from 'react-hot-toast';

import defaultProfile from '../../assets/defaultProfile.jpg';
import { useNavigate } from "react-router-dom";

// Google Auth
const provider = new GoogleAuthProvider();

const generateUsername = (email) => {
    return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
}

export const signInWithGoogle = async () => {

    const navigate = useNavigate();
        try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        if (user) {
            const userDocRef = doc(db, "Users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // Generate username based on email 
                const username = generateUsername(user.email);
                console.log("Generated Username: ", username); 

                await setDoc(userDocRef, {
                    username: username,
                    email: user.email,
                    id: user.uid,
                    profilePic: defaultProfile,
                    blocked: [],
                    signUpDate: new Date().toISOString(),
                });

                const userChatDoc = doc(db, "UserChats", user.uid);
                await setDoc(userChatDoc, {
                    chats: [],
                });
                
                toast.success("Account created successfully.");
            } else {
                toast.success("Login successfully.");
            }
            navigate(`/profile/${user.uid}`);
        }
    } catch (error) {
        console.log("Google Sign-In Error: ", error);
        toast.error("Google Sign-In failed. Please try again.");
    }
};