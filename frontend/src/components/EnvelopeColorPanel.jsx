import { envelopeDesigns, resolveEnvelopeDesign } from '../config/envelopeDesigns.js';
import { useState } from 'react';
import { api } from '../api/client.js';
import { useUI } from '../context/UIContext.jsx';
import './envelope-color-panel.css';
import Button from './ui/Button.jsx';

export default function EnvelopeColorPanel({ invitation, onUpdated, onLivePreview, sandbox = false }) {
    const { toast } = useUI();
    const background = invitation.themeSettings?.background || {};
    const saved = background.envelopeColor || '';
    const [color, setColor] = useState(saved);
    const savedDesign = resolveEnvelopeDesign(background.envelopeDesign);
    const [design, setDesign] = useState(savedDesign);
    const [saving, setSaving] = useState(false);

    function preview(value, nextDesign = design) {
        setColor(value);
        setDesign(nextDesign);
        onLivePreview?.({ themeSettings: { ...invitation.themeSettings, background: { ...background, envelopeColor: value, envelopeDesign: nextDesign } } });
    }

    async function save() {
        setSaving(true);
        try {
            const themeSettings = sandbox
                ? { ...invitation.themeSettings, background: { ...background, envelopeColor: color, envelopeDesign: design } }
                : (await api.patch('/invitations/me/theme', { invitationId: invitation.id, background: { envelopeColor: color, envelopeDesign: design } })).data.themeSettings;
            onUpdated({ ...invitation, themeSettings });
            onLivePreview?.(null);
            toast.success('Desain amplop tersimpan.');
        } catch {
            toast.error('Desain amplop belum tersimpan. Coba lagi.');
        } finally {
            setSaving(false);
        }
    }

    const swatchColor = /^#[\da-f]{6}$/i.test(color) ? color : envelopeDesigns[design].color;

    return <div>
        <h2 className="panel-header">Amplop</h2>
        <fieldset className="envelope-design-picker" disabled={saving}>
            <legend>Desain amplop</legend>
            {Object.entries(envelopeDesigns).map(([id, option]) => <label key={id}>
                <input type="radio" name="envelope-design" checked={design === id} onChange={() => preview('', id)} />
                <img src={'/assets/engine-4/' + option.thumbnail} alt="" />
                <span>{option.name}</span>
            </label>)}
        </fieldset>
        <div className="envelope-color-card">
            <label className="envelope-color-picker" htmlFor="envelope-color">
                <input id="envelope-color" type="color" value={swatchColor} disabled={saving} onChange={event => preview(event.target.value)} />
                <span>Pilih warna <small>{swatchColor.toUpperCase()}</small></span>
            </label>
            <div className="envelope-color-actions">
                <Button variant="secondary" disabled={!color || saving} onClick={() => preview('')}>Reset bawaan</Button>
                <Button variant="primary" disabled={color === saved && design === savedDesign} isLoading={saving} onClick={save}>Simpan amplop</Button>
            </div>
        </div>
    </div>;
}
