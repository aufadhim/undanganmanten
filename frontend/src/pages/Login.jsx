import {plannerInviteContext} from '../utils/plannerInviteContext.js';
import { DashboardThemeToggle } from '../components/atelier/CanvasRouteFrame.jsx';
import Brand from '../components/atelier/Brand.jsx';
import AuthArtwork from '../components/atelier/AuthArtwork.jsx';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { api, setToken, getToken } from '../api/client.js';
import LangSwitcher from '../components/LangSwitcher.jsx';

export default function Login() {
    const { t } = useTranslation();
    const inviteContext = plannerInviteContext(window.location.search);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

    useEffect(() => {
        if (getToken()) {
            window.location.replace(inviteContext.returnPath || '/dashboard');
        }
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            setToken(res.data.token);
            window.location.replace(inviteContext.returnPath || (res.data.user?.role === 'ADMIN' ? '/admin' : '/dashboard'));
        } catch (err) {
            setError(err.response?.data?.error || t('auth.login_fail'));
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSuccess(credentialResponse) {
        setError('');
        setLoading(true);
        try {
            if (!credentialResponse?.credential) {
                throw new Error('Google belum mengirim hasil login. Silakan coba lagi.');
            }
            const res = await api.post('/auth/google', { credential: credentialResponse.credential });
            if (typeof res.data?.token !== 'string' || !res.data.token.trim()) {
                throw new Error('Server belum membuat sesi login. Silakan coba lagi.');
            }
            setToken(res.data.token);
            window.location.replace(inviteContext.returnPath || (res.data.user?.role === 'ADMIN' ? '/admin' : '/dashboard'));
        } catch (err) {
            setError(err.response?.data?.error || (err.code === 'ERR_NETWORK'
                ? 'Tidak dapat terhubung ke server Samavaya. Pastikan backend berjalan, lalu coba lagi.'
                : err.message || t('auth.google_fail')));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-screen">
            <div className="atelier-auth-language">
                <DashboardThemeToggle />
                <LangSwitcher style={{ background: 'var(--auth-paper)', color: 'var(--auth-ink)', borderColor: 'var(--auth-line)' }} />
            </div>
            
            <div className="auth-left">
                <div className="auth-card">
                    <Brand className="auth-brand"/>
                    <h1 className="auth-title">{t('auth.login_title', 'Welcome')}</h1>
                    <p className="auth-subtitle">{t('auth.login_sub', 'Lanjutkan mengedit undangan pernikahanmu.')}</p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <label className="field">
                            <span>{t('auth.email', 'Email')}</span>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" autoComplete="email" required />
                        </label>
                        <label className="field">
                            <span>{t('auth.password', 'Password')}</span>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kata sandi kamu" autoComplete="current-password" required />
                            <div style={{ textAlign: 'right', marginTop: '4px' }}>
                                <Link to="/forgot-password" style={{ color: 'var(--ink-soft)', fontSize: '12px', textDecoration: 'underline' }}>
                                    Lupa password?
                                </Link>
                            </div>
                        </label>

                        {error && <div className="form-error" role="alert">{error}</div>}

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? t('auth.processing') : t('auth.login_btn', 'Login')}
                        </button>
                    </form>

                    {googleEnabled && <>
                        {loading && <p className="auth-google-status" role="status">Menghubungkan akun…</p>}
                        <div className="auth-or">{t('auth.or_email', 'or')}</div>
                        <div style={{ marginBottom: 20 }}>
                            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError(t('auth.google_fail'))} useOneTap width="100%" />
                        </div>
                    </>}
                    
                    <p className="auth-switch">
                        {t('auth.no_account', "Don't have an account?")} <Link to={'/signup'+inviteContext.query}>{t('auth.register_here', 'Create account')}</Link>
                    </p>
                </div>
            </div>

            <AuthArtwork/>
        </div>
    );
}
