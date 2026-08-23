import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormDraft } from '../hooks/useFormDraft.js';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';
import { useUI } from '../context/UIContext.jsx';

const DEFAULT_QUOTES = {
    islam: {
        text: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berfikir.",
        source: "QS. Ar-Rum: 21"
    },
    kristen: {
        text: "Sebab itu seorang laki-laki akan meninggalkan ayahnya dan ibunya dan bersatu dengan isterinya, sehingga keduanya menjadi satu daging.",
        source: "Kejadian 2:24"
    },
    katolik: {
        text: "Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.",
        source: "Matius 19:6"
    },
    hindu: {
        text: "Om iha imav indra sam nudha cakravakeva dampati. prajayau gunavanau visvam ayur vyasnutam.",
        source: "Rgveda X.85.42"
    },
    budha: {
        text: "Cinta sejati selalu memancarkan kebahagiaan. Jika cintamu belum memancarkan kebahagiaan, itu belum disebut cinta sejati.",
        source: "Thich Nhat Hanh"
    }
};

export default function KutipanPanel({ invitation, onUpdated, onLivePreview }) {
    const { t } = useTranslation();
    const [saving, setSaving] = useState(false);
    
    const { toast } = useUI();

    const draftKey = `draft_kutipan_${invitation.id}`;

    const [form, setForm, clearDraft] = useFormDraft(draftKey, {
        enabled: invitation?.quoteSettings?.enabled || false,
        religion: invitation?.quoteSettings?.religion || 'islam',
        customText: invitation?.quoteSettings?.customText || '',
        customSource: invitation?.quoteSettings?.customSource || '',
    });

    useEffect(() => {
        if (onLivePreview) {
            onLivePreview({ quoteSettings: form });
        }
    }, [form, onLivePreview]);

    function update(field, value) {
        setForm(f => {
            const nextForm = { ...f, [field]: value };
            if (field === 'religion' && value !== 'custom') {
                nextForm.customText = DEFAULT_QUOTES[value].text;
                nextForm.customSource = DEFAULT_QUOTES[value].source;
            }
            if (field === 'religion' && value === 'custom') {
                const quote = invitation?.quoteSettings || {};
                if (quote.religion === 'custom') {
                    nextForm.customText = quote.customText;
                    nextForm.customSource = quote.customSource;
                } else {
                    nextForm.customText = '';
                    nextForm.customSource = '';
                }
            }
            return nextForm;
        });
    }

    async function handleSave() {
        setSaving(true);
        try {
            const res = await api.patch('/invitations/me/quote', form);
            const updatedQuote = res.data?.quoteSettings;
            onUpdated({ ...invitation, quoteSettings: updatedQuote });
            clearDraft();
            toast.success('Pengaturan Kutipan berhasil disimpan!');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Gagal menyimpan kutipan.');
        } finally {
            setSaving(false);
        }
    }

    const isCustom = form.religion === 'custom';

    return (
        <>
            <h2 className="panel-header">Kutipan & Doa</h2>
            <p className="panel-sub">Tambahkan kutipan ayat suci, puisi, atau kalimat pembuka sebelum profil mempelai.</p>

            <div className="section-block">
                <div className="stack" style={{ marginTop: '0px' }}>
                        <div>
                            <span className="field-label">Pilih Tema Kutipan</span>
                            <div className="select-wrapper">
                                <select 
                                    value={form.religion} 
                                    onChange={(e) => update('religion', e.target.value)}
                                >
                                    <option value="islam">Agama Islam (Ar-Rum 21)</option>
                                    <option value="kristen">Agama Kristen (Kejadian 2:24)</option>
                                    <option value="katolik">Agama Katolik (Matius 19:6)</option>
                                    <option value="hindu">Agama Hindu (Rgveda X.85.42)</option>
                                    <option value="budha">Agama Buddha</option>
                                    <option value="custom">Teks Custom (Puisi / Lirik)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <span className="field-label">Teks Kutipan</span>
                            <textarea 
                                className="text-area" 
                                rows="6"
                                value={form.customText || (isCustom ? '' : DEFAULT_QUOTES[form.religion]?.text)} 
                                onChange={(e) => update('customText', e.target.value)}
                                disabled={!isCustom}
                                placeholder={isCustom ? "Tuliskan kutipan Anda di sini..." : ""}
                                style={{ resize: 'vertical' }}
                            />
                            {!isCustom && (
                                <p style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                                    Pilih "Teks Custom" jika ingin mengubah kalimat ini.
                                </p>
                            )}
                        </div>

                        <div>
                            <span className="field-label">Sumber Kutipan (Opsional)</span>
                            <input 
                                className="text-input" 
                                value={form.customSource || (isCustom ? '' : DEFAULT_QUOTES[form.religion]?.source)} 
                                onChange={(e) => update('customSource', e.target.value)}
                                disabled={!isCustom}
                                placeholder="Contoh: QS. Ar-Rum: 21, Shakespeare, dll."
                            />
                        </div>
                    </div>
            </div>

            <Button variant="primary" onClick={handleSave} isLoading={saving}>
                Simpan Pengaturan
            </Button>
        </>
    );
}
