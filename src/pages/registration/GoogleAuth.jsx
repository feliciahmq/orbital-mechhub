import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from 'react-hot-toast';

import defaultProfile from '../../assets/defaultProfile.jpg';

// Google Auth
const provider = new GoogleAuthProvider();

const generateRandomDigits = () => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // generates a random 4-digit number
};

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        if (user) {
            const userDocRef = doc(db, "Users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // Generate username only if the user does not exist in Firestore
                const randomDigits = generateRandomDigits();
                const username = `${user.displayName.replace(/\s+/g, '').toLowerCase()}${randomDigits}`;
                console.log("Generated Username: ", username); // Print the generated username

                await setDoc(userDocRef, {
                    email: user.email,
                    username: username,
                    profilePic: defaultProfile,
                    signUpDate: new Date().toISOString(),
                });
                toast.success("Account created successfully.");
            } else {
                toast.success("Login successfully.");
            }
            window.location.href = `/profile/${user.uid}`;
        }
    } catch (error) {
        console.log("Google Sign-In Error: ", error);
        toast.error("Google Sign-In failed. Please try again.");
    }
};