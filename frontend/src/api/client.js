import axios from 'axios';
import { API_BASE_URL } from '../config/env.js';

export const api = axios.create({ baseURL: API_BASE_URL });

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
