import api from './axios';

export const buildGoogleOAuthUrl = () => {
  const redirectUri = import.meta.env.VITE_FRONTEND_URL;
  if (!redirectUri) {
    throw new Error('VITE_FRONTEND_URL is not configured');
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email',
    access_type: 'offline',
    prompt: 'consent',
  }).toString()}`;
};

export const isWaitlistAuthResponse = (data) =>
  data != null &&
  typeof data.waitlist === 'boolean' &&
  Boolean(data.Message ?? data.message) &&
  !data.jwt_data &&
  !data.user &&
  data.access == null &&
  data.refresh == null;

export const isWaitlistFlowResult = (data) =>
  data != null &&
  typeof data.waitlist === 'boolean' &&
  Boolean(data.message ?? data.Message) &&
  data.user == null &&
  data.jwt_data == null;

export const toWaitlistResult = (data) => ({
  waitlist: data.waitlist,
  message: data.Message ?? data.message,
});

const normalizeGoogleAuthPayload = (data) => {
  if (!data || data.jwt_data) {
    return data;
  }

  if (data.user && (data.access || data.refresh)) {
    return {
      ...data,
      jwt_data: {
        access: data.access,
        refresh: data.refresh,
      },
    };
  }

  return data;
};

export const completeGoogleAuth = async (code) => {
  try {
    const response = await api.get('/auth/google/', { params: { code } });
    const data = response.data;
    if (isWaitlistAuthResponse(data) || typeof data?.waitlist === 'boolean') {
      return toWaitlistResult(data);
    }
    return normalizeGoogleAuthPayload(data);
  } catch (err) {
    const data = err.response?.data;
    if (isWaitlistAuthResponse(data) || typeof data?.waitlist === 'boolean') {
      return toWaitlistResult(data);
    }
    const message =
      data?.detail ||
      data?.error ||
      data?.Message ||
      'Google authentication failed. Please try again.';
    throw new Error(
      typeof message === 'string' ? message : 'Google authentication failed. Please try again.'
    );
  }
};

export const credentialAuth = async (type, email, password) => {
  try {
    const response = await api.post(`/auth/auth/?type=${type}`, { email, password });
    const data = response.data;
    if (isWaitlistAuthResponse(data)) {
      return toWaitlistResult(data);
    }
    return data;
  } catch (err) {
    const data = err.response?.data;
    if (isWaitlistAuthResponse(data)) {
      return toWaitlistResult(data);
    }
    throw err;
  }
};

export const normalizeAuthResponse = (data) => {
  const user = data.user;
  const jwtData = data.jwt_data ?? {
    access: data.access,
    refresh: data.refresh,
  };

  return {
    user,
    tokens: {
      access: jwtData?.access,
      refresh: jwtData?.refresh,
    },
  };
};
