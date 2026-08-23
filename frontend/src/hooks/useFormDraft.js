import { useState, useEffect } from 'react';

/**
 * Custom hook untuk menyimpan draft form sementara di localStorage.
 * Berguna agar jika halaman di-reload sebelum disimpan ke database, isian tidak hilang.
 */
export function useFormDraft(key, initialData) {
    const [form, setForm] = useState(() => {
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Kita gabungkan initialData dari DB dengan draft, agar jika ada kolom baru di DB
                // tetap masuk, tapi prioritas tetap pada draft yang ada di localStorage.
                if (typeof initialData === 'object' && initialData !== null && !Array.isArray(initialData)) {
                    return { ...initialData, ...parsed };
                }
                return parsed !== undefined && parsed !== null ? parsed : initialData;
            }
        } catch (e) {
            console.error("Gagal membaca draft dari localStorage", e);
        }
        return initialData;
    });

    // Simpan ke localStorage setiap kali form berubah
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(form));
    }, [key, form]);

    // Fungsi untuk menghapus draft (dipanggil setelah sukses simpan ke DB)
    const clearDraft = () => {
        localStorage.removeItem(key);
    };

    return [form, setForm, clearDraft];
}
