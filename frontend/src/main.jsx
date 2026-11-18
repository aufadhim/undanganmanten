import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './styles/index.css';
import './styles/atelier.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './i18n';

// An open tab can still reference a route bundle from the previous deployment.
window.addEventListener('vite:preloadError', (event) => {
    const key = 'samavaya-route-reload';
    try {
        const lastReload = Number(sessionStorage.getItem(key) || 0);
        if (Date.now() - lastReload < 30000) return;
        sessionStorage.setItem(key, String(Date.now()));
    } catch {
        return;
    }
    event.preventDefault();
    window.location.reload();
});

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const app = googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}><App /></GoogleOAuthProvider>
) : <App />;

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {app}
    </React.StrictMode>
);

import "./styles/ivory-text-wash.css";
