import { DashboardThemeToggle } from '../components/atelier/CanvasRouteFrame.jsx';
import Brand from '../components/atelier/Brand.jsx';
import AuthArtwork from '../components/atelier/AuthArtwork.jsx';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import LangSwitcher from '../components/LangSwitcher.jsx';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || '';
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            setError('Password harus minimal 8 karakter serta mengandung huruf dan angka.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Konfirmasi password tidak cocok.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setCompleted(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Password gagal diubah. Tautan mungkin sudah kedaluwarsa.');
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
                    <h1 className="auth-title">Buat password baru</h1>

                    {!token ? (
                        <div>
                            <div className="form-error" role="alert">Tautan reset password tidak valid atau tidak lengkap.</div>
                            <p className="auth-switch"><Link className="sam-action-link" to="/forgot-password">Minta tautan baru</Link></p>
                        </div>
                    ) : completed ? (
                        <div>
                            <div className="form-success" role="status">Password berhasil diubah. Silakan login menggunakan password baru.</div>
                            <button type="button" className="btn-primary" onClick={() => navigate('/login')} style={{ width: '100%', marginTop: 20 }}>
                                Lanjut ke login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="auth-form">
                            <p className="auth-subtitle">Gunakan minimal 8 karakter dengan kombinasi huruf dan angka.</p>
                            <label className="field">
                                <span>Password baru</span>
                                <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={8} required />
                            </label>
                            <label className="field">
                                <span>Konfirmasi password baru</span>
                                <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} required />
                            </label>
                            {error && <div className="form-error" role="alert">{error}</div>}
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Menyimpan...' : 'Simpan password baru'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
            <AuthArtwork/>
        </div>
    );
}
