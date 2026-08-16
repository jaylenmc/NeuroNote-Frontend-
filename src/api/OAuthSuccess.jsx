import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { normalizeAuthResponse } from './authApi';
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

    const finishLogin = (parsed) => {
      try {
        const { user, tokens } = normalizeAuthResponse(parsed);
        if (!user || !tokens?.access) {
          throw new Error('Incomplete auth response');
        }
        login(user, tokens);
        navigate('/dashboard', { replace: true });
      } catch (parseError) {
        console.error('Failed to process auth payload:', parseError);
        redirectToSignin('Authentication failed. Please try again.');
      }
    };

    const pendingAuth = sessionStorage.getItem('pending_auth');
    if (pendingAuth) {
      sessionStorage.removeItem('pending_auth');
      try {
        finishLogin(JSON.parse(pendingAuth));
      } catch (parseError) {
        console.error('Failed to parse pending auth:', parseError);
        redirectToSignin('Authentication failed. Please try again.');
      }
      return;
    }

    const error = searchParams.get('error');
    if (error) {
      redirectToSignin('Authentication was cancelled or failed. Please try again.');
      return;
    }

    const authPayload = searchParams.get('auth');
    if (authPayload) {
      try {
        finishLogin(JSON.parse(decodeURIComponent(authPayload)));
      } catch (parseError) {
        console.error('Failed to parse auth payload:', parseError);
        redirectToSignin('Authentication failed. Please try again.');
      }
      return;
    }

    redirectToSignin('Authentication failed. Please try again.');
  }, [searchParams, navigate, login]);

  return (
    <div className="auth-loading-container">
      <BrainLoader size={80} label="Loading" />
    </div>
  );
}

export default Authentication;
