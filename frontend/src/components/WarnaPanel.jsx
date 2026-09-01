import { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { useFormDraft } from '../hooks/useFormDraft.js';
import Button from './ui/Button.jsx';
import { useUI } from '../context/UIContext.jsx';


// Palet Warna Default Bawaan Masing-masing Tema (Sebagai Acuan Undo/Reset)
const DEFAULT_PALETTES = {
    'celluloid': {
        bgPrimary: '#211913', bgSecondary: '#211913', textPrimary: '#8a2d2d',
        textSecondary: '#efe1c8', btnBg: '#8a2d2d', btnText: '#211913',
    },
    'nocturne': {
        bgPrimary: '#08090B', bgSecondary: '#121014', textPrimary: '#751C30',
        textSecondary: '#EEE7DC', btnBg: '#C5A46A', btnText: '#08090B',
    },
    'eternal': {
        bgPrimary: '#fafaf9',
        bgSecondary: '#f5f5f4',
        textPrimary: '#292524',
        textSecondary: '#1c1917',
        btnBg: '#292524',
        btnText: '#fafaf9',
    },
    'seraya': {
        bgPrimary: '#F4F1EA',
        bgSecondary: '#DEDAD1',
        textPrimary: '#0A0A0A',
        textSecondary: '#4A4945',
        btnBg: '#111111',
        btnText: '#FFFFFF',
    },
    'nawasena': {
        bgPrimary: '#F4EDDF',
        bgSecondary: '#D9C9AD',
        textPrimary: '#741D2B',
        textSecondary: '#243322',
        btnBg: '#A4894E',
        btnText: '#FFFFFF',
    },
    'isvara': {
        bgPrimary: '#F3F0E8', bgSecondary: '#DFE3D5', textPrimary: '#465440',
        textSecondary: '#30372F', btnBg: '#78846C', btnText: '#FFFFFF',
    },
    'lanqing': {
        bgPrimary: '#F6EBDD', bgSecondary: '#E9C9B6', textPrimary: '#8D1B24',
        textSecondary: '#341B18', btnBg: '#A8232D', btnText: '#FFF8E8',
    },
    'exclusive-olan': {
        bgPrimary: '#EEE8E5',
        bgSecondary: '#E4D5C0',
        textPrimary: '#7E3942',
        textSecondary: '#1E3F43',
        btnBg: '#7E3942',
        btnText: '#EEE8E5',
    },
    'eloise': {
        bgPrimary: '#FDFBF7',
        bgSecondary: '#E9EDC9',
        textPrimary: '#2A9D8F',
        textSecondary: '#264653',
        btnBg: '#2A9D8F',
        btnText: '#FFFFFF',
    },
    'chinese': {
        bgPrimary: '#0A1128',
        bgSecondary: '#1C2541',
        textPrimary: '#F4D06F',
        textSecondary: '#E0E1DD',
        btnBg: '#D62828',
        btnText: '#F4D06F',
    },
    // Fallback default jika themeId lain
    'default': {
        bgPrimary: '#FAF3E3',
        bgSecondary: '#E3D6B4',
        textPrimary: '#7A2436',
        textSecondary: '#182420',
        btnBg: '#7A2436',
        btnText: '#FFFFFF',
    }
};

export default function WarnaPanel({ invitation, onUpdated, onLivePreview }) {
    const themeId = invitation?.themeId || 'exclusive-olan';
    const defaultColors = DEFAULT_PALETTES[themeId] || DEFAULT_PALETTES['default'];

    const draftKeyColors = `draft_warna_${invitation?.id}`;
    const { toast, confirm } = useUI();

    // State Warna
    const [colors, setColors, clearDraftColors] = useFormDraft(draftKeyColors, {
        bgPrimary: defaultColors.bgPrimary,
        bgSecondary: defaultColors.bgSecondary,
        textPrimary: defaultColors.textPrimary,
        textSecondary: defaultColors.textSecondary,
        btnBg: defaultColors.btnBg,
        btnText: defaultColors.btnText,
    });

    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    // Sincronize data jika invitation berubah
    useEffect(() => {
        if (invitation?.themeSettings) {
            const ts = invitation.themeSettings;
            setColors({
                bgPrimary: ts.background?.primary || defaultColors.bgPrimary,
                bgSecondary: ts.background?.secondary || defaultColors.bgSecondary,
                textPrimary: ts.bodyText?.primary || defaultColors.textPrimary,
                textSecondary: ts.bodyText?.secondary || defaultColors.textSecondary,
                btnBg: ts.button?.primary || defaultColors.btnBg,
                btnText: ts.button?.text || defaultColors.btnText,
            });
        }
    }, [invitation?.id, themeId]);

    // Handle Perubahan Warna Manual
    function handleChange(key, val) {
        setColors((prev) => {
            const next = { ...prev, [key]: val };
            if (onLivePreview) {
                // Construct temporary theme settings override
                onLivePreview({
                    themeSettings: {
                        ...(invitation?.themeSettings || {}),
                        background: {
                            primary: next.bgPrimary,
                            secondary: next.bgSecondary,
                        },
                        bodyText: {
                            primary: next.textPrimary,
                            secondary: next.textSecondary,
                            tertiary: next.textPrimary, // mapped as fallback
                        },
                        button: {
                            primary: next.btnBg,
                            text: next.btnText,
                        }
                    }
                });
            }
            return next;
        });
    }

    // FUNSI UNDO / RESET KE DEFAULT TEMA
    async function handleResetToDefault() {
        const isConfirmed = await confirm(
            'Reset Warna',
            'Yakin ingin mengembalikan seluruh warna ke kombinasi asli bawaan tema?'
        );
        if (!isConfirmed) return;

        setColors(defaultColors);
        await saveColorSettings(defaultColors, 'Warna berhasil di-reset ke default!');
    }

    // Simpan ke Backend
    async function handleSubmit(e) {
        if (e) e.preventDefault();
        await saveColorSettings(colors, 'Kombinasi warna berhasil disimpan!');
    }

    async function saveColorSettings(targetColors, successMsg) {
        setSaving(true);
        setMsg('');

        const payload = {
            background: {
                primary: targetColors.bgPrimary,
                secondary: targetColors.bgSecondary,
            },
            bodyText: {
                primary: targetColors.textPrimary,
                secondary: targetColors.textSecondary,
                tertiary: targetColors.textPrimary,
            },
            button: {
                primary: targetColors.btnBg,
                text: targetColors.btnText,
            },
        };

        try {
            const res = await api.patch('/invitations/me/theme', payload);
            toast.success(successMsg);
            clearDraftColors();
            if (onUpdated) {
                onUpdated(res.data.invitation);
            }
            if (onLivePreview) {
                onLivePreview(null); // Clear live preview overrides so it uses saved data
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Gagal menyimpan skema warna.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="panel-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                    <h3 className="panel-title" style={{ margin: 0 }}>Custom Palet Warna</h3>
                    <p className="panel-sub" style={{ margin: '4px 0 0 0' }}>
                        Kustomisasi warna latar, teks, dan tombol sesuai selera kalian.
                    </p>
                </div>

                {/* TOMBOL UNDO / RESET KE DEFAULT */}
                <Button
                    type="button"
                    variant="secondary"
                    onClick={handleResetToDefault}
                    style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap'
                    }}
                    title="Kembalikan ke warna asli tema"
                    icon={<i className="fa-solid fa-rotate-left"></i>}
                >
                    Reset Bawaan
                </Button>
            </div>

            {msg && (
                <div style={{ padding: '8px 12px', background: '#f6ffed', border: '1px solid #b7eb8f', color: '#52c41a', borderRadius: '8px', fontSize: '12px', marginBottom: '16px' }}>
                    ✓ {msg}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* BAGIAN 1: WARNA BACKGROUND */}
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e3d6b4', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '13px', color: '#182420', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <i className="fa-solid fa-palette" style={{ color: 'var(--wine)' }}></i> Background / Latar Layar
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>Utama (Primary)</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={colors.bgPrimary}
                                    onChange={(e) => handleChange('bgPrimary', e.target.value)}
                                    style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    value={colors.bgPrimary}
                                    onChange={(e) => handleChange('bgPrimary', e.target.value)}
                                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '11px' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>Sekunder (Kartu/Header)</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={colors.bgSecondary}
                                    onChange={(e) => handleChange('bgSecondary', e.target.value)}
                                    style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    value={colors.bgSecondary}
                                    onChange={(e) => handleChange('bgSecondary', e.target.value)}
                                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '11px' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* BAGIAN 2: WARNA TEKS */}
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e3d6b4', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '13px', color: '#182420', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <i className="fa-solid fa-pen-nib" style={{ color: 'var(--wine)' }}></i> Teks &amp; Judul
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>Judul &amp; Aksen</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={colors.textPrimary}
                                    onChange={(e) => handleChange('textPrimary', e.target.value)}
                                    style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    value={colors.textPrimary}
                                    onChange={(e) => handleChange('textPrimary', e.target.value)}
                                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '11px' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>Teks Isi / Paragraf</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={colors.textSecondary}
                                    onChange={(e) => handleChange('textSecondary', e.target.value)}
                                    style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    value={colors.textSecondary}
                                    onChange={(e) => handleChange('textSecondary', e.target.value)}
                                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '11px' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* BAGIAN 3: WARNA TOMBOL */}
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e3d6b4', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '13px', color: '#182420', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <i className="fa-regular fa-circle-dot" style={{ color: 'var(--wine)' }}></i> Tombol Aksi (Buka Undangan, Maps, dll)
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>Background Tombol</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={colors.btnBg}
                                    onChange={(e) => handleChange('btnBg', e.target.value)}
                                    style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    value={colors.btnBg}
                                    onChange={(e) => handleChange('btnBg', e.target.value)}
                                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '11px' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>Teks Tombol</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={colors.btnText}
                                    onChange={(e) => handleChange('btnText', e.target.value)}
                                    style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    value={colors.btnText}
                                    onChange={(e) => handleChange('btnText', e.target.value)}
                                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '11px' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SUBMIT BUTTON */}
                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={saving}
                    style={{ marginTop: '8px' }}
                >
                    Simpan Perubahan Warna
                </Button>

            </form>
        </div>
    );
}
