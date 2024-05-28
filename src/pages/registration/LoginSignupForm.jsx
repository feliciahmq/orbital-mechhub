import React, { useState } from 'react';
import './LoginSignupForm.css'; 
import GoogleLogo from '../../assets/google-logo.png';

function LoginSignUpForm() {
    const [rightPanelActive, setRightPanelActive] = useState(false);

    return (
        <div>
            <div className={`container ${rightPanelActive ? 'right-panel-active' : ''}`} id="container">
                <div className="form-container sign-up-container">
                    <form action="#">
                        <h1>Create Account</h1>
                        <div className="social-container">
                            <a href="#" className="social">
                                <img src={GoogleLogo} className="social-logo" alt="logo" />
                            </a>
                        </div>
                        <span>or use your email to register</span>
                        <input type="text" placeholder="Username" />
                        <input type="email" placeholder="Email" />
                        <input type="password" placeholder="Password" />
                        <button>Sign up</button>
                    </form>
                </div>
                <div className="form-container log-in-container">
                    <form action="#">
                        <h1>Login</h1>
                        <div className="social-container">
                            <a href="#" className="social">
                                <img src={GoogleLogo} className="social-logo" alt="logo" />
                            </a>
                        </div>
                        <span>or use your account</span>
                        <input type="email" placeholder="Email" />
                        <input type="password" placeholder="Password" />
                        <a href="#">Forgot password</a>
                        <button>Log in</button>
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
