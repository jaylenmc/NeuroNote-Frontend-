import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { completeGoogleAuth } from './authApi';
import BrainLoader from '../components/BrainLoader';
import './OAuthSuccess.css';

function StateCheck() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) {
      return;
    }
    hasHandled.current = true;

    const redirectToSignin = (message) => {
      sessionStorage.setItem('auth_error', message);
      navigate('/signin', { replace: true });
    };

    const oauthError = searchParams.get('error');
    if (oauthError) {
      redirectToSignin('Authentication was cancelled or failed. Please try again.');
      return;
    }

    const code = searchParams.get('code');
    const responseState = searchParams.get('state');

    if (!code || !responseState) {
      redirectToSignin('Missing authorization data. Please try again.');
      return;
    }

    const sessionState = sessionStorage.getItem('state');
    sessionStorage.removeItem('state');

    if (!sessionState || sessionState !== responseState) {
      redirectToSignin('Invalid OAuth state. Please try again.');
      return;
    }

    const finishAuth = async () => {
      try {
        const data = await completeGoogleAuth(code);
        if (typeof data?.waitlist === 'boolean') {
          navigate('/notification-signup', {
            replace: true,
            state: { waitlist: data.waitlist },
          });
          return;
        }
        sessionStorage.setItem('pending_auth', JSON.stringify(data));

        const callbackUrl = import.meta.env.VITE_FRONTEND_URL || '/auth/callback/';
        const callbackPath = callbackUrl.startsWith('http')
          ? new URL(callbackUrl).pathname
          : callbackUrl;
        navigate(callbackPath, { replace: true });
      } catch (err) {
        redirectToSignin(err.message || 'Google authentication failed. Please try again.');
      }
    };

    finishAuth();
  }, [searchParams, navigate]);

  return (
    <div className="auth-loading-container">
      <BrainLoader size={80} label="Completing sign in" />
    </div>
  );
}

export default StateCheck;
