# Simpan Profil & Mempelai dalam satu transaksi

Endpoint: `PATCH /api/invitations/me/profile-content`.

Payload: `{invitationId, profile, themeSettings}`. Pengaturan tema di endpoint ini dibatasi pada karakter, URL ilustrasi, dan visibilitas bio. Validasi kedua bagian selesai sebelum transaksi dimulai. Kepemilikan undangan diperiksa di transaksi; route memakai autentikasi serta middleware editableInvitation yang sama dengan editor.

Controller menyimpan profil dan pengaturan menggunakan transaction client yang sama. Persetujuan ilustrasi juga memakai transaction client tersebut. Kegagalan salah satu write membatalkan semuanya. Pembersihan media dijadwalkan setelah commit, tidak di dalam transaksi.

`persistThemeSettings` adalah service bersama untuk endpoint tema lama dan simpan profil gabungan. Kolom JSON wajib tetap disediakan pada create upsert, sementara update hanya berisi properti yang berubah.

Frontend ProfilPanel mengirim satu request, satu notifikasi, dan menghapus draft hanya sesudah sukses. Input profil/karakter dinonaktifkan selama save agar perubahan baru tidak hilang saat respons datang. Saat gagal, isian dan draft tetap tersedia untuk diulang. Endpoint lama dipertahankan untuk kompatibilitas pemanggil lain.

useFormDraft kini menyimpan hanya nilai yang berbeda dari baseline. Setelah clearDraft, baseline diperbarui sehingga efek React tidak membuat ulang draft yang sudah disimpan. Perpindahan invitation memakai key terpisah; nilai server baru memperbarui form yang tidak sedang memiliki perubahan lokal.

Validasi: 12 tes terarah lulus (transaksi sukses, rollback, input invalid, kepemilikan, partial settings, preset, dan penyimpanan draft). Seluruh tes memakai data tiruan. Cek browser pada undangan yang sedang terbuka: tombol save berhasil dengan satu status loading, input terkunci selama proses, lalu aktif lagi tanpa error console baru. Tidak mengganti tema atau isi undangan selama cek terakhir. Belum dilakukan build produksi atau keseluruhan suite.
