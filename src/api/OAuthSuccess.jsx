import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  completeGoogleAuth,
  normalizeAuthResponse,
  isWaitlistFlowResult,
} from './authApi';
import { useAuth } from '../auth/AuthContext';
import BrainLoader from '../components/BrainLoader';
import './OAuthSuccess.css';

function Authentication() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
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

    const finishWaitlist = (waitlist) => {
      navigate('/notification-signup', {
        replace: true,
        state: { waitlist },
      });
    };

    const error = searchParams.get('error');
    if (error) {
      redirectToSignin('Authentication was cancelled or failed. Please try again.');
      return;
    }

    const code = searchParams.get('code');
    if (!code) {
      redirectToSignin('Missing authorization code. Please try again.');
      return;
    }

    (async () => {
      try {
        const data = await completeGoogleAuth(code);

        if (typeof data?.waitlist === 'boolean' || isWaitlistFlowResult(data)) {
          finishWaitlist(data.waitlist);
          return;
        }

        const { user, tokens } = normalizeAuthResponse(data);
        if (!user || !tokens?.access) {
          throw new Error('Incomplete auth response');
        }
        login(user, tokens);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        redirectToSignin(err.message || 'Google authentication failed.');
      }
    })();
  }, [searchParams, navigate, login]);

  return (
    <div className="auth-loading-container">
      <BrainLoader size={80} label="Loading" />
    </div>
  );
}

export default Authentication;
