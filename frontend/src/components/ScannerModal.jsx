import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '../api/client.js';

export default function ScannerModal({ isOpen, onClose }) {
    const [scannedData, setScannedData] = useState(null);
    const [scanning, setScanning] = useState(true);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setScannedData(null);
            setResult(null);
            setScanning(true);
            return;
        }

        const scanner = new Html5QrcodeScanner("reader", {
            qrbox: { width: 250, height: 250 },
            fps: 10,
        });

        scanner.render(async (decodedText) => {
            scanner.clear();
            setScanning(false);
            setScannedData(decodedText);
            
            try {
                // Lakukan HTTP Request untuk check-in ke decodedText (guestId)
                const res = await api.post(`/invitations/me/guests/${decodedText}/checkin`);
                setResult({ success: true, data: res.data });
            } catch (err) {
                setResult({ success: false, error: err.response?.data?.error || 'Gagal check-in tamu' });
            }
        }, (error) => {
            // Abaikan error background scanning
        });

        return () => {
            scanner.clear().catch(e => console.error(e));
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '400px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 16px' }}>Scan QR Code Tamu</h3>
                
                {scanning ? (
                    <div id="reader" style={{ width: '100%' }}></div>
                ) : (
                    <div style={{ padding: '20px 0' }}>
                        {result?.success ? (
                            <div style={{ color: 'green' }}>
                                <i className="fa-solid fa-circle-check" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                                <h4>Check-in Berhasil!</h4>
                                <p>Tamu: {result.data.guest?.name}</p>
                            </div>
                        ) : (
                            <div style={{ color: 'red' }}>
                                <i className="fa-solid fa-circle-xmark" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                                <h4>Check-in Gagal</h4>
                                <p>{result?.error}</p>
                            </div>
                        )}
                        <button 
                            onClick={() => {
                                setScannedData(null);
                                setResult(null);
                                setScanning(true);
                            }}
                            style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '16px' }}
                        >
                            Scan Ulang
                        </button>
                    </div>
                )}
                
                <div style={{ marginTop: '20px' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', background: '#e0e0e0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
