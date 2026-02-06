import React from 'react';
import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import './signin.css';
import generateState from '../utils/auth';

function Signin() {
    const handleGoogleSignIn = () => {
        const state = generateState();
        sessionStorage.setItem('oauth_state', state);
        
        // Get the frontend URL from environment variable
        const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
        if (!frontendUrl) {
            console.error('VITE_FRONTEND_URL is not set in environment variables');
            alert('Configuration error: Frontend URL not set. Please contact support.');
            return;
        }
        const redirectUri = import.meta.env.VITE_FRONTEND_URL;

        const OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth?' +
        new URLSearchParams({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            redirect_uri: redirectUri,
            response_type: "code",
            scope: 'openid email profile',
            access_type: 'offline',
            prompt: 'consent',
            state: state
        }).toString();

        window.location.href = OAUTH_URL;
    };

    return (
        <div className="signin-page">
            <Link to="/" className="signin-back">← Back to home</Link>
            <div className="signin-container">
                <div className="signin-box">
                    <div className="signin-branding">
                        <img
                            src="/NeuroNote Logo Transparent.png"
                            alt="NeuroNote"
                            className="signin-logo"
                        />
                        <h1 className="signin-heading">Join The Waitlist</h1>
                        <p className="signin-tagline">Study smarter with spaced repetition and active recall.</p>
                    </div>
                    <div className="signin-content">
                        <button
                            type="button"
                            className="signin-google-btn"
                            onClick={handleGoogleSignIn}
                        >
                            <FcGoogle className="signin-google-icon" />
                            <span>Continue with Google</span>
                        </button>
                        <p className="signin-agree">
                            By continuing, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signin;