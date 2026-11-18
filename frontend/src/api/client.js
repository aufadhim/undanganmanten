import axios from 'axios';
import {notify,finishNotification,dismissNotification} from '../utils/notifications.js';
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
    config.sessionToken = token;
    if (activeInvitationId && !config.headers['x-invitation-id']) config.headers['x-invitation-id'] = activeInvitationId;
    if(config.notification!==false&&!String(config.url).startsWith('/auth/')&&['post','put','patch','delete'].includes(config.method?.toLowerCase())){
        const settings=config.notification||{},upload=typeof FormData!=='undefined'&&config.data instanceof FormData;
        const checkout=String(config.url).includes('/checkout');
        const label=checkout?'Menyiapkan pembayaran…':upload?'Mengunggah media…':config.method==='delete'?'Menghapus…':String(config.url).includes('reorder')?'Menyimpan urutan…':'Menyimpan perubahan…';
        config.notificationId=notify(settings.loading||label,'loading');
        config.notificationSuccess=settings.success||(checkout?'Halaman pembayaran siap.':config.method==='delete'?'Berhasil dihapus.':upload?'Berhasil diunggah.':'Perubahan tersimpan.');
        if(upload){const previous=config.onUploadProgress;config.onUploadProgress=event=>{previous?.(event);const percent=event.total?Math.round(event.loaded/event.total*100):null;notify(percent===100?'Memproses unggahan…':`${settings.loading||'Mengunggah media…'}${percent===null?'':` ${percent}%`}`,'loading',{id:config.notificationId,progress:percent})}}
    }
    return config;
});

function readableError(error) {
    const status = error.response?.status;
    const data = error.response?.data;
    const supplied = typeof data?.error === 'string' ? data.error.trim() : '';
    const technical = /^(?:Internal Server Error|Bad Request|Unauthorized|Forbidden|Not Found|Network Error|Service Unavailable|Bad Gateway|Gateway Timeout)[.!]?$/i.test(supplied)
        || /<html|<!doctype|prisma|SQLSTATE|ECONN|stack trace|TypeError|Error 1033/i.test(supplied);
    if (supplied && !technical) return supplied;
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return 'Samavaya terlalu lama merespons. Tunggu sebentar, lalu coba lagi.';
    if (!status && navigator.onLine === false) return 'Perangkatmu sedang offline. Sambungkan ke internet, lalu coba lagi.';
    if (!status || status >= 500) return 'Samavaya sedang sulit dihubungi. Tunggu sebentar, lalu coba lagi.';
    if (status === 401) return 'Silakan masuk kembali untuk melanjutkan.';
    if (status === 403) return 'Akunmu belum punya akses untuk tindakan ini.';
    if (status === 404) return 'Halaman atau data yang kamu cari tidak ditemukan.';
    if (status === 429) return 'Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi.';
    return 'Tindakan belum berhasil. Periksa isianmu, lalu coba lagi.';
}

api.interceptors.response.use(
    (response) => {const config=response.config;if(config.notificationId)finishNotification(config.notificationId,config.notificationSuccess||'Proses selesai.');return response;},
    (error) => {
        if (!axios.isCancel(error)) {
            const message = readableError(error);
            error.message = message;
            if (error.response) {
                const data = error.response.data;
                error.response.data = { ...(data && typeof data === 'object' && !Array.isArray(data) ? data : {}), error: message };
            }
        }
        if(error.config?.notificationId){if(axios.isCancel(error))dismissNotification(error.config.notificationId);else finishNotification(error.config.notificationId,error.message,'error')}

        if (error.response?.status === 401 && error.config?.sessionToken && error.config.sessionToken === localStorage.getItem('um_token')) {
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
