import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import './signin.css';
import { buildGoogleOAuthUrl, credentialAuth, normalizeAuthResponse, isWaitlistFlowResult } from '../api/authApi';
import { useAuth } from './AuthContext';
import { generateState } from "../utils/auth.js"

function Signin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [authMode, setAuthMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const storedError = sessionStorage.getItem('auth_error');
        if (storedError) {
            setError(storedError);
            sessionStorage.removeItem('auth_error');
        }
    }, []);

    const handleGoogleSignIn = () => {
        try {
            const state = generateState();
            sessionStorage.setItem("state", state);
            window.location.href = buildGoogleOAuthUrl(state);
        } catch (err) {
            console.error(err);
            setError('Configuration error: Backend redirect URI not set.');
        }
    };

    const handleCredentialSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await credentialAuth(authMode, email, password);
            if (isWaitlistFlowResult(data)) {
                navigate('/notification-signup', { state: { waitlist: data.waitlist } });
                return;
            }
            const { user, tokens } = normalizeAuthResponse(data);
            login(user, tokens);
            navigate('/dashboard');
        } catch (err) {
            const message =
                err.response?.data?.detail ||
                err.response?.data?.Message ||
                err.response?.data?.email?.[0] ||
                err.response?.data?.password?.[0] ||
                'Authentication failed. Please try again.';
            setError(typeof message === 'string' ? message : 'Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signin-page">
            <div className="signin-container">
                <div className="signin-box">
                    <div className="signin-branding">
                        <img
                            src="/NeuroNote Logo Transparent.png"
                            alt="NeuroNote"
                            className="signin-logo"
                        />
                        <h1 className="signin-heading">Welcome to NeuroNote</h1>
                        <p className="signin-tagline">Study smarter with spaced repetition and active recall.</p>
                    </div>

                    <div className="signin-content">
                        {error && <p className="signin-error">{error}</p>}

                        <button
                            type="button"
                            className="signin-google-btn"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                        >
                            <FcGoogle className="signin-google-icon" />
                            <span>Continue with Google</span>
                        </button>

                        <div className="signin-divider">
                            <span>or</span>
                        </div>

                        <div className="signin-mode-toggle">
                            <button
                                type="button"
                                className={`signin-mode-btn ${authMode === 'login' ? 'active' : ''}`}
                                onClick={() => setAuthMode('login')}
                                disabled={isLoading}
                            >
                                Log in
                            </button>
                            <button
                                type="button"
                                className={`signin-mode-btn ${authMode === 'signup' ? 'active' : ''}`}
                                onClick={() => setAuthMode('signup')}
                                disabled={isLoading}
                            >
                                Sign up
                            </button>
                        </div>

                        <form className="signin-form" onSubmit={handleCredentialSubmit}>
                            <label className="signin-label" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="signin-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                            />

                            <label className="signin-label" htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="signin-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="8-16 characters"
                                required
                                minLength={8}
                                maxLength={16}
                                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                            />

                            <button
                                type="submit"
                                className="signin-submit-btn"
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? 'Please wait...'
                                    : authMode === 'login'
                                        ? 'Log in'
                                        : 'Create account'}
                            </button>
                        </form>

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
