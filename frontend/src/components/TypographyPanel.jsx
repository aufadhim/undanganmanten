import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import { useTranslation } from 'react-i18next';
import { useUI } from '../context/UIContext';
import debounce from 'lodash.debounce';

const FONTS = [
    { value: "'Playfair Display', serif", label: 'Playfair Display' },
    { value: "'Cinzel', serif", label: 'Cinzel' },
    { value: "'Cormorant Garamond', serif", label: 'Cormorant Garamond' },
    { value: "'Montserrat', sans-serif", label: 'Montserrat' },
    { value: "'Lato', sans-serif", label: 'Lato' },
    { value: "'Inter', sans-serif", label: 'Inter' },
    { value: "'Manrope', sans-serif", label: 'Manrope' },
    { value: "'Great Vibes', cursive", label: 'Great Vibes' },
    { value: "'Dancing Script', cursive", label: 'Dancing Script' },
    { value: "'Outfit', sans-serif", label: 'Outfit' },
    { value: "'DM Serif Display', serif", label: 'DM Serif Display' },
    { value: "'Bodoni Moda', serif", label: 'Bodoni Moda' },
    { value: "'Libre Baskerville', serif", label: 'Libre Baskerville' },
    { value: "'Lora', serif", label: 'Lora' },
    { value: "'Marcellus', serif", label: 'Marcellus' },
    { value: "'Prata', serif", label: 'Prata' },
    { value: "'Poppins', sans-serif", label: 'Poppins' },
    { value: "'Jost', sans-serif", label: 'Jost' },
    { value: "'Sacramento', cursive", label: 'Sacramento' },
    { value: "'Caveat', cursive", label: 'Caveat' },
];

const DEFAULT_TYPOGRAPHY = {
    fontHeading: "'Playfair Display', serif",
    fontBody: "'Manrope', sans-serif",
    headingLineHeight: 1.15,
    bodyLineHeight: 1.65,
    headingLetterSpacing: 0,
    bodyLetterSpacing: 0,
};

function RangeControl({ label, value, min, max, step, unit = '', onChange }) {
    return (
        <label style={{ display: 'block', marginBottom: 18 }}>
            <span style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8, fontSize: 13, color: '#374151' }}>
                <strong>{label}</strong>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: '#7a2436' }}>{Number(value).toFixed(step < 0.1 ? 2 : 1)}{unit}</span>
            </span>
            <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} style={{ width: '100%', accentColor: '#7a2436' }} />
        </label>
    );
}

export default function TypographyPanel({ invitation, onUpdated, onLivePreview }) {
    const { t } = useTranslation();
    const { toast } = useUI();
    const [saving, setSaving] = useState(false);

    const [typography, setTypography] = useState(DEFAULT_TYPOGRAPHY);

    useEffect(() => {
        if (invitation?.themeSettings?.typography) {
            setTypography({ ...DEFAULT_TYPOGRAPHY, ...invitation.themeSettings.typography });
        }
    }, [invitation?.id]);

    // Live preview debounce
    const updatePreview = useMemo(
        () => debounce((newTypo) => {
            if (onLivePreview) {
                onLivePreview({
                    themeSettings: {
                        ...invitation?.themeSettings,
                        typography: newTypo
                    }
                });
            }
        }, 300),
        [invitation, onLivePreview]
    );

    useEffect(() => () => updatePreview.cancel(), [updatePreview]);

    const handleTypographyChange = (field, value) => {
        const newTypo = { ...typography, [field]: value };
        setTypography(newTypo);
        updatePreview(newTypo);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.patch('/invitations/me/theme', {
                typography: typography
            });
            // Merge themeSettings back into invitation for the parent
            if (onUpdated) {
                onUpdated({ ...invitation, themeSettings: { ...invitation.themeSettings, ...res.data.themeSettings } });
            }
            toast.success('Pengaturan Typography berhasil disimpan');
            if (onLivePreview) onLivePreview(null);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Gagal menyimpan typography');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="panel-content">
            <div style={{ marginBottom: '24px' }}>
                <h2 className="panel-header" style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Ubah Typography</h2>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                    Sesuaikan jenis huruf, jarak baris, dan kerapatan karakter undangan Anda.
                </p>
            </div>

            <div className="panel-form">
                <div className="form-group" style={{ marginBottom: '32px' }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Font Heading (Judul Utama)</label>
                    <div className="select-wrapper" style={{ marginBottom: '8px' }}>
                        <select 
                            value={typography.fontHeading || "'Playfair Display', serif"} 
                            onChange={(e) => handleTypographyChange('fontHeading', e.target.value)}
                        >
                            {FONTS.map(font => (
                                <option key={font.value} value={font.value}>{font.label}</option>
                            ))}
                        </select>
                    </div>
                    <p className="form-help" style={{ marginBottom: '16px', color: '#6b7280', fontSize: '0.85rem' }}>Digunakan untuk nama mempelai dan judul seksi besar.</p>
                    
                    <div style={{ 
                        padding: '32px 24px', 
                        background: 'linear-gradient(to right bottom, #ffffff, #fafaf9)', 
                        borderRadius: '12px', 
                        border: '1px solid #e5e7eb', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: '-10px', left: '-10px', fontSize: '120px', color: '#f3f4f6', opacity: '0.6', fontFamily: 'serif', lineHeight: '1', zIndex: '0', userSelect: 'none' }}>Aa</div>
                        <h1 style={{ 
                            fontFamily: typography.fontHeading, 
                            margin: 0, 
                            fontSize: '2.5rem', 
                            color: '#111827', 
                            fontWeight: 'normal',
                            lineHeight: typography.headingLineHeight,
                            letterSpacing: `${typography.headingLetterSpacing}em`,
                            position: 'relative',
                            zIndex: '1'
                        }}>
                            Romeo & Juliet
                        </h1>
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '32px' }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Font Body (Teks Isi)</label>
                    <div className="select-wrapper" style={{ marginBottom: '8px' }}>
                        <select 
                            value={typography.fontBody || "'Manrope', sans-serif"} 
                            onChange={(e) => handleTypographyChange('fontBody', e.target.value)}
                        >
                            {FONTS.map(font => (
                                <option key={font.value} value={font.value}>{font.label}</option>
                            ))}
                        </select>
                    </div>
                    <p className="form-help" style={{ marginBottom: '16px', color: '#6b7280', fontSize: '0.85rem' }}>Digunakan untuk paragraf panjang, deskripsi, informasi acara, dsb.</p>
                    
                    <div style={{ 
                        padding: '32px 24px', 
                        background: 'linear-gradient(to right bottom, #ffffff, #fafaf9)', 
                        borderRadius: '12px', 
                        border: '1px solid #e5e7eb', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: '5px', left: '10px', fontSize: '60px', color: '#f3f4f6', opacity: '0.8', fontFamily: 'serif', lineHeight: '1', zIndex: '0', userSelect: 'none' }}>"</div>
                        <p style={{ 
                            fontFamily: typography.fontBody, 
                            margin: 0, 
                            fontSize: '1.05rem', 
                            color: '#4b5563', 
                            lineHeight: typography.bodyLineHeight,
                            letterSpacing: `${typography.bodyLetterSpacing}em`,
                            position: 'relative',
                            zIndex: '1',
                            textAlign: 'center'
                        }}>
                            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kami.
                        </p>
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: 32, padding: 20, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
                    <h3 style={{ margin: '0 0 6px', fontSize: 15, color: '#1f2937' }}>Jarak &amp; Kerapatan</h3>
                    <p className="form-help" style={{ margin: '0 0 20px', color: '#6b7280', fontSize: 12 }}>Heading dan teks isi diatur terpisah agar judul dekoratif tetap cantik tanpa mengurangi keterbacaan paragraf.</p>
                    <RangeControl label="Jarak baris heading" value={typography.headingLineHeight} min={0.8} max={2} step={0.05} onChange={(value) => handleTypographyChange('headingLineHeight', value)} />
                    <RangeControl label="Jarak huruf heading" value={typography.headingLetterSpacing} min={-0.08} max={0.3} step={0.01} unit="em" onChange={(value) => handleTypographyChange('headingLetterSpacing', value)} />
                    <RangeControl label="Jarak baris teks isi" value={typography.bodyLineHeight} min={1} max={2.5} step={0.05} onChange={(value) => handleTypographyChange('bodyLineHeight', value)} />
                    <RangeControl label="Jarak huruf teks isi" value={typography.bodyLetterSpacing} min={-0.04} max={0.2} step={0.01} unit="em" onChange={(value) => handleTypographyChange('bodyLetterSpacing', value)} />
                </div>

                <div className="panel-actions" style={{ marginTop: '30px' }}>
                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <span><i className="fa-solid fa-spinner fa-spin"></i> Menyimpan...</span>
                        ) : (
                            <span><i className="fa-solid fa-floppy-disk"></i> Simpan Typography</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
