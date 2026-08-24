import axios from 'axios';

const OAUTH_STATE_COOKIE = 'oauth_state';

const getApiUrl = () => {
    let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
    apiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
        apiUrl = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')
            ? `http://${apiUrl}`
            : `https://${apiUrl}`;
    }
    if (!apiUrl.includes('/api')) {
        apiUrl = `${apiUrl}/api`;
    }
    return apiUrl;
};

export const refreshToken = async () => {
    try {
        const apiBase = getApiUrl();
        const response = await axios.post(`${apiBase}/auth/token/refresh/`);
        const newToken = response.data.access;
        sessionStorage.setItem('jwt_token', newToken);
        return newToken;
    } catch (error) {
        console.error('Error refreshing token:', error);
        sessionStorage.removeItem('jwt_token');
        window.location.href = '/login';
        return null;
    }
};

export const getAuthHeader = async () => {
    let token = sessionStorage.getItem('jwt_token');
    if (!token) {
        return null;
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const handleApiError = async (error) => {
    if (error.response?.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
            return newToken;
        }
    }
    throw error;
};

export function generateState(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
        .map(x => chars[x % chars.length])
        .join('');
}

function getCookieDomain() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return null;
    }
    const parts = hostname.split('.');
    if (parts.length >= 2) {
        return `.${parts.slice(-2).join('.')}`;
    }
    return null;
}

function buildCookieAttributes(maxAgeSeconds) {
    const secure = window.location.protocol === 'https:';
    const domain = getCookieDomain();
    let attributes = `path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
    if (secure) {
        attributes += '; Secure';
    }
    if (domain) {
        attributes += `; domain=${domain}`;
    }
    return attributes;
}

export function clearOAuthStateCookie() {
    const attributes = buildCookieAttributes(0);
    document.cookie = `${OAUTH_STATE_COOKIE}=; ${attributes}`;
}

export default generateState;
