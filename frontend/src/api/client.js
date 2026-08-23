import axios from 'axios';
import { API_BASE_URL } from '../config/env.js';

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 20_000 });

let activeInvitationId = null;

export function setActiveInvitationId(id) {
    activeInvitationId = id;
}

export function getActiveInvitationId() {
    return activeInvitationId;
}

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('um_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (activeInvitationId) config.headers['x-invitation-id'] = activeInvitationId;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && localStorage.getItem('um_token')) {
            clearToken();
            if (!['/login', '/signup'].includes(window.location.pathname)) {
                window.location.assign('/login');
            }
        }
        return Promise.reject(error);
    }
);

export function setToken(token) {
    localStorage.setItem('um_token', token);
}

export function getToken() {
    return localStorage.getItem('um_token');
}

export function clearToken() {
    localStorage.removeItem('um_token');
    activeInvitationId = null;
}
