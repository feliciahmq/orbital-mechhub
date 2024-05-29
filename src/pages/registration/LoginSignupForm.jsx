import React, { useState } from 'react';
import GoogleLogo from '../../assets/google-logo.png';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import './LoginSignupForm.css'; 

import { auth, db } from "../../firebase/firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { query, collection, where, getDocs, doc, setDoc } from "firebase/firestore";
import { signInWithGoogle } from './GoogleAuth';

function LoginSignUpForm() {
    const [rightPanelActive, setRightPanelActive] = useState(false);

    // navigate
    const navigate = useNavigate();

    // Signup
    const [username, setUsername] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");

    const handleSignup = async(e) => {
        e.preventDefault(); // prevent page reload

        if (username.trim() === "" || signupEmail.trim() === "" || signupPassword.trim() === "") {
            toast.error("All fields are required.");
            return;
        }

        try {
            const usernamesQuery = query(collection(db, "Users"), where("username", "==", username));
            const usernamesSnapshot = await getDocs(usernamesQuery);

            if (!usernamesSnapshot.empty) {
                console.log("Username is already in use.")
                toast.error("Username is already in use.");
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
            const user = userCredential.user;
            console.log("User created: ", user);

            if (user) {
                const userDocRef = doc(db, "Users", user.uid);
                await setDoc(userDocRef, {
                    username: username,
                    email: user.email
                });
                console.log("User ID:", user.uid);
                toast.success("Account created successfully.");
            }
            navigate('/profile');
        } catch (error) {
            let errorMessage = 'An error occurred.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'The email address is already in use.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password must be at least six characters.';
            }
            console.log(error.message);
            toast.error(errorMessage);
        }
    }; 

    // Login
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        if (loginEmail.trim() === "" || loginPassword.trim() === "") {
            toast.error("All fields are required.");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            console.log("Login successfully.");
            toast.success("Login successfully.");
            navigate('/profile');
        } catch (error) {
            let errorMessage = 'An error occurred.';
            console.log("Firebase Login Error: ", error.code, error.message);

            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No user found with this email.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'The email address is invalid.';
            } 
            toast.error(errorMessage);
        }
    };

    return (
        <div>
            <div className={`container ${rightPanelActive ? 'right-panel-active' : ''}`} id="container">
                <div className="form-container sign-up-container">

                    {/* Sign up */}
                    <form onSubmit={handleSignup}>
                        <h1>Create Account</h1>
                        <div className="social-container">
                            <a onClick={signInWithGoogle} className="google-btn">
                                <img src={GoogleLogo} alt="google-logo" />
                                Continue with Google
                            </a>
                        </div>
                        <span>or use your email to register</span>
                        <input type="text" placeholder="Username" 
                            value={username} onChange={(e) => setUsername(e.target.value)} required />
                        <input type="email" placeholder="Email" 
                            value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                        <input type="password" placeholder="Password" 
                            value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                        <button type="submit">Sign up</button>
                    </form>
                </div>
                <div className="form-container log-in-container">

                    {/* Login */}
                    <form onSubmit={handleLogin}>
                        <h1>Login</h1>
                        <div className="social-container">
                            <a onClick={signInWithGoogle} className="google-btn">
                                <img src={GoogleLogo} alt="google-logo" />
                                Continue with Google
                            </a>
                        </div>
                        <span>or use your email</span>
                        <input type="email" placeholder="Email" 
                            value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                        <input type="password" placeholder="Password" 
                            value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                        {/* <a href="#">Forgot password</a> */}
                        <button type="submit">Log in</button>
                    </form>
                </div>
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Already have an account?</h1>
                            <p>Keep connected with us!</p>
                            <button className="ghost" id="login" onClick={() => setRightPanelActive(false)}>Log In</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Don't have an account yet?</h1>
                            <p>Start your journey with us!</p>
                            <button className="ghost" id="signup" onClick={() => setRightPanelActive(true)}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginSignUpForm;