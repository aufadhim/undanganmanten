import { prisma } from '../lib/prisma.js';
/**
 * Nonaktifkan invitation yang sudah lewat expiresAt.
 * Data dan media tetap disimpan agar dapat dipulihkan atau diperpanjang.
 * Dipanggil otomatis oleh cron di server.js, atau bisa dijalankan manual
 * lewat `npm run cron:expire`.
 */
export async function runExpireJob() {
    const now = new Date();

    const where = { expiresAt: { lt: now }, status: { not: 'expired' } };
    const expired = await prisma.invitation.findMany({ where, select: { id: true, slug: true } });

    console.log(`[expire-job] Ditemukan ${expired.length} invitation yang sudah expired.`);

    if (expired.length > 0) {
        await prisma.invitation.updateMany({ where, data: { status: 'expired' } });
    }

    expired.forEach((invitation) => {
        console.log(`[expire-job] Invitation ${invitation.slug} (${invitation.id}) dinonaktifkan.`);
    });

    return expired.length;
}

// Kalau file ini dijalankan langsung lewat `node src/jobs/expireInvitations.js`
// (bukan di-import), jalankan sekali lalu exit. Berguna buat testing manual.
if (import.meta.url === `file://${process.argv[1]}`) {
    runExpireJob()
        .then((count) => {
            console.log(`Selesai. ${count} invitation dinonaktifkan.`);
            process.exit(0);
        })
        .catch((err) => {
            console.error('Gagal menjalankan expire job:', err);
            process.exit(1);
        });
}
