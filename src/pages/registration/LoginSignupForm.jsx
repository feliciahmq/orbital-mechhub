import React, { useState } from 'react';
import GoogleLogo from '../../assets/google-logo.png';
import { useNavigate } from 'react-router-dom';

import './LoginSignupForm.css'; 

import { auth, db } from "../../firebase/firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

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

        try {
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
            }
            navigate('/profile');
        } catch (error) {
            console.log(error.message);
        }
    }; 

    // Login
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            console.log("Logged in successfully!");
            navigate('/profile');
        } catch (error) {
            console.log(error.message);
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
                            <a href="#" className="social">
                                <img src={GoogleLogo} className="social-logo" alt="logo" />
                            </a>
                        </div>
                        <span>or use your email to register</span>
                        <input type="text" placeholder="Username" 
                            value={username} onChange={(e) => setUsername(e.target.value)} required />
                        <input type="email" placeholder="Email" 
                            value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                        <input type="password" placeholder="Password" 
                            value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                        <button type="button" onClick={handleSignup}>Sign up</button>
                    </form>
                </div>
                <div className="form-container log-in-container">

                    {/* Login */}
                    <form onSubmit={handleLogin}>
                        <h1>Login</h1>
                        <div className="social-container">
                            <a href="#" className="social">
                                <img src={GoogleLogo} className="social-logo" alt="logo" />
                            </a>
                        </div>
                        <span>or use your account</span>
                        <input type="email" placeholder="Email" 
                            value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                        <input type="password" placeholder="Password" 
                            value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                        {/* <a href="#">Forgot password</a> */}
                        <button type="button" onClick={handleLogin}>Log in</button>
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
