import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { api, setToken, getToken } from '../api/client.js';
import LangSwitcher from '../components/LangSwitcher.jsx';

export default function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (getToken()) {
            navigate('/dashboard');
        }
    }, [navigate]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            setToken(res.data.token);
            if (res.data.user?.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || t('auth.login_fail'));
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSuccess(credentialResponse) {
        try {
            const res = await api.post('/auth/google', { credential: credentialResponse.credential });
            setToken(res.data.token);
            if (res.data.user?.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || t('auth.google_fail'));
        }
    }

    return (
        <div className="auth-screen">
            <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
                <LangSwitcher style={{ background: 'var(--auth-paper)', color: 'var(--auth-ink)', borderColor: 'var(--auth-line)' }} />
            </div>
            
            <div className="auth-left">
                <div className="auth-card">
                    <div className="auth-brand">
                        <img src="/logo.png" alt="UndanganManten Logo" style={{ height: 22, marginRight: 8 }} />
                        UNDANGANMANTEN
                    </div>
                    <h1 className="auth-title">{t('auth.login_title', 'Welcome')}</h1>
                    <p className="auth-subtitle">{t('auth.login_sub', 'Lanjutkan mengedit undangan pernikahanmu.')}</p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <label className="field">
                            <span>{t('auth.email', 'Email')}</span>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" required />
                        </label>
                        <label className="field">
                            <span>{t('auth.password', 'Password')}</span>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
                            <div style={{ textAlign: 'right', marginTop: '4px' }}>
                                <Link to="/forgot-password" style={{ color: 'var(--ink-soft)', fontSize: '12px', textDecoration: 'underline' }}>
                                    Lupa password?
                                </Link>
                            </div>
                        </label>

                        {error && <div className="form-error">{error}</div>}

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? t('auth.processing') : t('auth.login_btn', 'Login')}
                        </button>
                    </form>

                    <div className="auth-or">
                        {t('auth.or_email', 'or')}
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError(t('auth.google_fail'))}
                            useOneTap
                            width="100%"
                        />
                    </div>
                    
                    <p className="auth-switch">
                        {t('auth.no_account', "Don't have an account?")} <Link to="/signup">{t('auth.register_here', 'Create account')}</Link>
                    </p>
                </div>
            </div>

            <div className="auth-right">
                <div className="iphone-mockup">
                    <div className="dynamic-island"></div>
                    <div className="iphone-screen">
                        <div className="mockup-invitation">
                            <h4>The Wedding of</h4>
                            <h2>Rangga</h2>
                            <div className="and">&</div>
                            <h2>Cinta</h2>
                            <div className="mockup-date">
                                12 . 10 . 2026
                            </div>
                            <div className="mockup-photo"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
