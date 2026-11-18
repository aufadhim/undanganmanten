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
import { useUI } from '../context/UIContext.jsx';

export default function Signup() {
    const { t } = useTranslation();
    const inviteContext = plannerInviteContext(window.location.search);

    const [step, setStep] = useState(1); // 1: Signup, 2: OTP
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    
    const { toast } = useUI();

    useEffect(() => {
        if (getToken()) {
            window.location.replace(inviteContext.returnPath || '/dashboard');
        }
    }, []);

    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    async function handleSignupSubmit(e) {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            setError('Password dan Konfirmasi Password tidak cocok.');
            return;
        }

        if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
            setError('Password harus minimal 8 karakter, mengandung huruf dan angka.');
            return;
        }

        if (!agreeToTerms) {
            setError('Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/signup', { email, password, phone, name });
            setStep(2); // Lanjut ke input OTP
        } catch (err) {
            setError(err.response?.data?.error || t('auth.login_fail'));
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifySubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/verify-email', { email, otp });
            setToken(res.data.token);
            window.location.replace(inviteContext.returnPath || '/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || t('auth.otp_fail'));
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

    const handleResendOtp = async () => {
        if (!canResend) return;
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/resend-otp', { email });
            toast.success('Kode OTP baru telah dikirim!');
            setTimer(60);
            setCanResend(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal mengirim ulang OTP');
        } finally {
            setLoading(false);
        }
    };

    if (step === 2) {
        return (
            <div className="auth-screen auth-signup">
                <div className="atelier-auth-language">
                    <DashboardThemeToggle />
                <LangSwitcher style={{ background: 'var(--auth-paper)', color: 'var(--auth-ink)', borderColor: 'var(--auth-line)' }} />
                </div>
                <div className="auth-left">
                    <div className="auth-card">
                        <Brand className="auth-brand"/>
                        <h1 className="auth-title">{t('auth.verify_title')}</h1>
                        <p className="auth-subtitle">{t('auth.verify_sub', { email })}</p>

                        <form onSubmit={handleVerifySubmit} className="auth-form">
                            <label className="field">
                                <span>{t('auth.otp')}</span>
                                <input 
                                    type="text" 
                                    value={otp} 
                                    onChange={(e) => setOtp(e.target.value)} 
                                    maxLength={6} 
                                    placeholder="000000"
                                    style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '20px' }}
                                    required 
                                />
                            </label>
                            {error && <div className="form-error" role="alert">{error}</div>}
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? t('auth.verifying') : t('auth.verify_btn')}
                            </button>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '13px', fontFamily: 'Manrope, sans-serif' }}>
                                <button 
                                    type="button" 
                                    onClick={() => { setStep(1); setOtp(''); }}
                                    style={{ background: 'none', border: 'none', color: 'var(--auth-ink-soft)', cursor: 'pointer', padding: 0 }}
                                >
                                     Kembali
                                </button>
                                
                                <button 
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={!canResend || loading}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        color: canResend ? 'var(--auth-wine)' : 'var(--auth-ink-soft)', 
                                        fontWeight: canResend ? '600' : 'normal',
                                        cursor: canResend ? 'pointer' : 'not-allowed',
                                        padding: 0 
                                    }}
                                >
                                    {canResend ? 'Kirim Ulang OTP' : `Kirim Ulang (${timer}s)`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <AuthArtwork/>
            </div>
        );
    }

    return (
        <div className="auth-screen auth-signup">
            <div className="atelier-auth-language">
                <DashboardThemeToggle />
                <LangSwitcher style={{ background: 'var(--auth-paper)', color: 'var(--auth-ink)', borderColor: 'var(--auth-line)' }} />
            </div>
            
            <div className="auth-left">
                <div className="auth-card">
                    <Brand className="auth-brand"/>
                    <h1 className="auth-title">{t('auth.signup_title', 'Create account')}</h1>
                    <p className="auth-subtitle">{t('auth.signup_sub', 'Mulai buat undangan pernikahan digitalmu sekarang.')}</p>

                    <form onSubmit={handleSignupSubmit} className="auth-form">
                        <label className="field signup-field-name">
                            <span>{t('auth.name', 'Nama Lengkap')}</span>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Anda" required />
                        </label>
                        <label className="field signup-field-email">
                            <span>{t('auth.email', 'Email')}</span>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Alamat email Anda" required />
                        </label>
                        <label className="field signup-field-phone">
                            <span>{t('auth.phone', 'Nomor WhatsApp')}</span>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812..." required />
                        </label>
                        <label className="field signup-field-password">
                            <span>{t('auth.password', 'Kata Sandi')}</span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                                placeholder="Min. 8 karakter, huruf & angka"
                                required
                            />
                            {password && (
                                <span style={{ 
                                    color: password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password) ? '#2e7d32' : 'var(--auth-ink-soft)', 
                                    fontSize: '11px', 
                                    marginTop: '2px' 
                                }}>
                                    {password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password) 
                                        ? '✓ Format sandi valid' 
                                        : 'Sandi minimal 8 karakter, mengandung huruf dan angka.'}
                                </span>
                            )}
                        </label>
                        <label className="field signup-field-confirm_password">
                            <span>{t('auth.confirm_password', 'Konfirmasi Kata Sandi')}</span>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={8}
                                placeholder="Ketik ulang kata sandi"
                                style={{ 
                                    borderColor: confirmPassword 
                                        ? (password === confirmPassword ? '#2e7d32' : 'var(--auth-wine)') 
                                        : '' 
                                }}
                                required
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <span style={{ color: 'var(--auth-wine)', fontSize: '11px', marginTop: '2px' }}>
                                    Password tidak cocok
                                </span>
                            )}
                            {confirmPassword && password === confirmPassword && (
                                <span style={{ color: '#2e7d32', fontSize: '11px', marginTop: '2px' }}>
                                    ✓ Password cocok
                                </span>
                            )}
                        </label>

                        <label className="field-checkbox" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '10px', marginBottom: '10px' }}>
                            <input 
                                type="checkbox" 
                                checked={agreeToTerms} 
                                onChange={(e) => setAgreeToTerms(e.target.checked)} 
                                style={{ marginTop: '3px' }}
                            />
                            <span>
                                Saya setuju dengan <Link to="/terms" target="_blank">Syarat & Ketentuan</Link> dan <Link to="/privacy" target="_blank">Kebijakan Privasi</Link>.
                            </span>
                        </label>

                        {error && <div className="form-error" role="alert">{error}</div>}

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? t('auth.processing') : t('auth.signup_btn', 'Create account')}
                        </button>
                    </form>

                    {googleEnabled && <>
                        {loading && <p className="auth-google-status" role="status">Menghubungkan akun…</p>}
                        <div className="auth-or">{t('auth.or_email', 'or')}</div>
                        <div style={{ marginBottom: 20 }}>
                            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError(t('auth.google_fail'))} useOneTap width="100%" text="signup_with" />
                        </div>
                    </>}
                    
                    <p className="auth-switch">
                        {t('auth.has_account', 'Already have an account?')} <Link className="sam-action-link" to={'/login'+inviteContext.query}>{t('auth.login_here', 'Login')}</Link>
                    </p>
                </div>
            </div>

            <AuthArtwork/>
        </div>
    );
}
