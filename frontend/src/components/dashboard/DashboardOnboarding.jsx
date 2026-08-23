import React from 'react';
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';
import CreateInvitationModal from '../CreateInvitationModal.jsx';

export default function DashboardOnboarding({
    showCreateModal,
    setShowCreateModal,
    selectedThemeId,
    handleSelectTheme,
    handleCreatedNew
}) {
    return (
        <div className="lp-onboarding lp" style={{ paddingTop: '76px' }}>
            <Header variant="dashboard" />

            <main className="lp-onboarding-main" style={{ paddingBottom: '100px' }}>
                <div className="lp-onboarding-hero">
                    <div className="lp-onboarding-hero-text">
                        <div className="eyebrow">
                            <span className="eyebrow-dot" /> Dashboard Pengantin
                        </div>
                        <h1>Siapkan Undangan yang <em>Dibuka</em>,<br />Bukan Ditumpuk di Laci.</h1>
                        <p>
                            Mulai buat draft undangan digital kalian sekarang secara gratis. Atur nama mempelai, pilih tema, dan preview langsung di genggaman.
                        </p>
                        <button className="lp-btn-seal lg" onClick={() => handleSelectTheme('exclusive-olan')}>
                            + Buat Undangan Pertama
                        </button>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div className="eyebrow center">Pilihan Wajah Undangan</div>
                    <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, margin: '6px 0', color: 'var(--ink)' }}>
                        Tema Populer Siap Pakai
                    </h2>
                    <p className="section-sub">Klik salah satu tema di bawah untuk mulai membuat undangan kalian.</p>
                </div>

                <div style={{ 
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                    gap: 30, maxWidth: 800, margin: '0 auto'
                }}>
                    <div onClick={() => handleSelectTheme('exclusive-olan')} style={{ 
                        background: 'var(--panel)', borderRadius: 20, padding: 15, 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                        border: '2px solid transparent', transition: 'all 0.3s', cursor: 'pointer'
                    }} className="theme-card-dash">
                        <div style={{ 
                            width: '100%', height: 350, borderRadius: 12, 
                            backgroundImage: `url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=400&h=800')`, backgroundSize: 'cover', backgroundPosition: 'center',
                            position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ 
                            position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.9)', 
                            padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 600, color: 'var(--wine)'
                            }}>
                            Mewah &amp; Eksklusif
                            </div>
                        </div>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--ink)', margin: '16px 0 0 0', fontSize: 20 }}>
                            Exclusive Olan
                        </h3>
                    </div>

                    <div onClick={() => handleSelectTheme('eloise')} style={{ 
                        background: 'var(--panel)', borderRadius: 20, padding: 15, 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                        border: '2px solid transparent', transition: 'all 0.3s', cursor: 'pointer'
                    }} className="theme-card-dash">
                        <div style={{ 
                            width: '100%', height: 350, borderRadius: 12, 
                            backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400&h=800')`, backgroundSize: 'cover', backgroundPosition: 'center',
                            position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ 
                            position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.9)', 
                            padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 600, color: 'var(--wine)'
                            }}>
                            Floral &amp; Nature
                            </div>
                        </div>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--ink)', margin: '16px 0 0 0', fontSize: 20 }}>
                            Eloise
                        </h3>
                    </div>

                    <div onClick={() => handleSelectTheme('chinese')} style={{ 
                        background: 'var(--panel)', borderRadius: 20, padding: 15, 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                        border: '2px solid transparent', transition: 'all 0.3s', cursor: 'pointer'
                    }} className="theme-card-dash">
                        <div style={{ 
                            width: '100%', height: 350, borderRadius: 12, 
                            backgroundImage: `url('https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=400&h=800')`, backgroundSize: 'cover', backgroundPosition: 'center',
                            position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ 
                            position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.9)', 
                            padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 600, color: 'var(--wine)'
                            }}>
                            Adat &amp; Oriental
                            </div>
                        </div>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--ink)', margin: '16px 0 0 0', fontSize: 20 }}>
                            Chinese Wedding
                        </h3>
                    </div>
                </div>

                <div style={{ background: 'var(--paper-deep)', padding: '60px 20px', marginTop: '80px' }}>
                    <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, margin: '0 0 40px 0', color: 'var(--ink)' }}>3 Langkah Mudah Memulai</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
                            <div>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--wine)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 20, fontWeight: 'bold' }}>1</div>
                                <h3 style={{ fontSize: 16, marginBottom: 8 }}>Pilih Tema</h3>
                                <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Temukan desain yang paling cocok dengan kepribadian dan gaya pernikahan kalian.</p>
                            </div>
                            <div>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--wine)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 20, fontWeight: 'bold' }}>2</div>
                                <h3 style={{ fontSize: 16, marginBottom: 8 }}>Isi Informasi Lengkap</h3>
                                <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Masukkan detail mempelai, waktu, tempat, dan cerita cinta kalian.</p>
                            </div>
                            <div>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--wine)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 20, fontWeight: 'bold' }}>3</div>
                                <h3 style={{ fontSize: 16, marginBottom: 8 }}>Bagikan Kebahagiaan</h3>
                                <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Undangan siap disebarkan ke keluarga dan teman terdekat.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer variant="dashboard" />
            <style>{`
                .theme-card-dash:hover {
                border-color: var(--wine) !important;
                transform: translateY(-5px);
                }
            `}</style>
            {showCreateModal && (
                <CreateInvitationModal
                    selectedThemeId={selectedThemeId}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleCreatedNew}
                />
            )}
        </div>
    );
}
