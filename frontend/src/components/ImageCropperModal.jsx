import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import Button from './ui/Button.jsx';
import { useUI } from '../context/UIContext.jsx';

export default function ImageCropperModal({ imageSrc, onComplete, onCancel, aspect = 1 }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const { toast } = useUI();

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        try {
            setIsProcessing(true);
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            onComplete(croppedImageBlob);
        } catch (e) {
            console.error('Failed to crop image', e);
            toast.error('Gagal memotong gambar.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: '100%', maxWidth: '500px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--ink)' }}>Sesuaikan Posisi Foto</h3>
                    <button onClick={onCancel} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--ink-soft)' }}>&times;</button>
                </div>
                
                {/* Area Cropper (Relative Container Required) */}
                <div style={{ position: 'relative', width: '100%', height: '400px', background: '#333' }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        cropShape={aspect === 1 ? 'round' : 'rect'}
                        showGrid={false}
                    />
                </div>
                
                {/* Kontrol Zoom */}
                <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--panel)' }}>
                    <label style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Geser untuk Zoom</label>
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', background: 'var(--panel)' }}>
                    <Button variant="secondary" onClick={onCancel} disabled={isProcessing} style={{ padding: '12px 24px', fontSize: '14px', height: '48px' }}>
                        Batal
                    </Button>
                    <Button variant="primary" onClick={handleSave} isLoading={isProcessing} style={{ margin: 0, padding: '12px 24px', height: '48px', flex: 1 }}>
                        Potong & Simpan
                    </Button>
                </div>
            </div>
        </div>
    );
}
