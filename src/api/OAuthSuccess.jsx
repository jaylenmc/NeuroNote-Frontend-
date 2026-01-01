import { useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext'
import './OAuthSuccess.css';

// Helper function to get properly formatted API URL
const getApiUrl = () => {
  let apiUrl = import.meta.env.VITE_API_URL || 'http://neuronote-backend-production.up.railway.app/api';
  // Remove trailing slash
  apiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  // Ensure protocol is included
  if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
    apiUrl = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') 
      ? `http://${apiUrl}` 
      : `https://${apiUrl}`;
  }
  // Ensure /api path is included
  if (!apiUrl.includes('/api')) {
    apiUrl = `${apiUrl}/api`;
  }
  console.log(`apiUrl: ${apiUrl}`)
  return apiUrl;
};

function Authentication() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth()

  useEffect(() => {
    const returnedState = searchParams.get('state');
    const storedState = sessionStorage.getItem('oauth_state');
    const code = searchParams.get('code');

    if (returnedState !== storedState) {
      console.error('OAuth state mismatch! Potential CSRF attack.');
      sessionStorage.setItem('auth_error', 'Authentication failed. Please try again.');
      navigate('/signin');
      return;
    }

    sessionStorage.removeItem('oauth_state');

    // Check for OAuth error
    const error = searchParams.get('error');
    if (error) {
      console.error('OAuth error:', error);
      sessionStorage.setItem('auth_error', 'Authentication was cancelled or failed. Please try again.');
      navigate('/signin');
      return;
    }

    if (code) {
      const apiBase = getApiUrl();
      axios.post(`${apiBase}/auth/google/`, { code })
        .then(async res => {
          console.log('Login successful', res.data)

          const { user, jwt_refresh } = res.data;

          // Check if user is the owner
          const ownerEmail = 'jayzilla195@gmail.com';
          const isOwner = user.email === ownerEmail;

          if (!isOwner) {
            // Non-owner: redirect to notification signup page
            // Do NOT store tokens or user data
            navigate('/notification-signup');
            return;
          }

          // Owner: proceed with normal login flow
          // Store the refresh token first
          sessionStorage.setItem('refresh_token', jwt_refresh);
          sessionStorage.setItem('user', JSON.stringify(user));

          // Make an initial token refresh to get an access token
          try {
            const refreshResponse = await axios.post(`${apiBase}/auth/token/refresh/`, {
              refresh_token: jwt_refresh
            }, {
              headers: {
                'Content-Type': 'application/json'
              }
            });

            const { access } = refreshResponse.data;
            sessionStorage.setItem('jwt_token', access);

            // Update the auth context
            login(user, { access, jwt_refresh });
            navigate('/dashboard');
          } catch (refreshError) {
            console.error('Failed to get initial access token:', refreshError);
            sessionStorage.setItem('auth_error', 'Authentication failed. Please try again.');
            navigate('/signin');
          }
        })
        .catch(err => {
          // Handle 401 Unauthorized from backend (non-owner users)
          if (err.response?.status === 401) {
            console.log('Unauthorized: User is not the owner');
            // Redirect to waitlist/notification signup page
            navigate('/notification-signup');
            return;
          }
          
          if (err.response) {
            console.log('OAuth error: ', err.response.data)
          } else {
            console.error('OAuth error', err);
          }
          sessionStorage.setItem('auth_error', 'Authentication failed. Please try again.');
          navigate('/signin');
        })
    } else {
      // No code parameter - user may have cancelled or there was an error
      console.error('No authorization code received');
      sessionStorage.setItem('auth_error', 'Authentication was cancelled or failed. Please try again.');
      navigate('/signin');
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="auth-loading-container">
      <h1 className="auth-loading-title">NEURONOTE</h1>
    </div>
  );
}

export default Authentication;