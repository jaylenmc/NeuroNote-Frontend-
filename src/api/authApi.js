import axios from 'axios';
import api from './axios';

export const buildGoogleOAuthUrl = (state) => {
  const redirectUri = import.meta.env.VITE_FRONTEND_STATE_CHECK;
  if (!redirectUri) {
    throw new Error('FRONTEND_STATE_CHECK is not configured');
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email',
    access_type: 'offline',
    prompt: 'consent',
    state,
  }).toString()}`;
};

export const isWaitlistAuthResponse = (data) =>
  Boolean(data?.Message && !data?.jwt_data && !data?.user);

export const completeGoogleAuth = async (code) => {
  const backendUrl = import.meta.env.VITE_BACKEND_DEV_REDIRECT_URI;
  if (!backendUrl) {
    throw new Error('BACKEND_DEV_REDIRECT_URI is not configured');
  }

  try {
    const response = await axios.get(backendUrl, { params: { code } });
    const data = response.data;
    if (isWaitlistAuthResponse(data)) {
      return { waitlist: true, message: data.Message };
    }
    return data;
  } catch (err) {
    const data = err.response?.data;
    if (isWaitlistAuthResponse(data)) {
      return { waitlist: true, message: data.Message };
    }
    const message =
      data?.detail ||
      data?.error ||
      data?.Message ||
      'Google authentication failed. Please try again.';
    throw new Error(typeof message === 'string' ? message : 'Google authentication failed. Please try again.');
  }
};

export const credentialAuth = async (type, email, password) => {
  const response = await api.post(`/auth/auth/?type=${type}`, { email, password });
  const data = response.data;
  if (isWaitlistAuthResponse(data)) {
    return { waitlist: true, message: data.Message };
  }
  return data;
};

export const normalizeAuthResponse = (data) => {
  const { user, jwt_data: jwtData } = data;

  return {
    user,
    tokens: {
      access: jwtData?.access,
      refresh: jwtData?.refresh,
    },
  };
};
