import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import LangSwitcher from '../components/LangSwitcher.jsx';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await api.post('/auth/forgot-password', { email });
            setMessage(response.data?.message || 'Instruksi reset password telah dikirim.');
        } catch (err) {
            setError(err.response?.data?.error || 'Permintaan reset password gagal diproses.');
        } finally {
            setLoading(false);
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
                    <h1 className="auth-title">Lupa password?</h1>
                    <p className="auth-subtitle">Masukkan email akunmu. Kami akan mengirim tautan untuk membuat password baru.</p>

                    {message ? (
                        <div>
                            <div className="form-success" role="status">{message}</div>
                            <p className="auth-switch" style={{ marginTop: 20 }}>
                                Belum menerima email? <button type="button" onClick={() => setMessage('')} className="auth-link-button">Coba lagi</button>
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="auth-form">
                            <label className="field">
                                <span>Email</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="Alamat email Anda"
                                    autoComplete="email"
                                    required
                                />
                            </label>
                            {error && <div className="form-error" role="alert">{error}</div>}
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Mengirim...' : 'Kirim tautan reset'}
                            </button>
                        </form>
                    )}

                    <p className="auth-switch">
                        <Link to="/login">← Kembali ke login</Link>
                    </p>
                </div>
            </div>
            <div className="auth-right" aria-hidden="true" />
        </div>
    );
}
