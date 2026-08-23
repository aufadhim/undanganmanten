import { prisma } from '../lib/prisma.js';
import { deleteFolderFromR2 } from '../lib/storage.js';

/**
 * Hapus invitation yang sudah lewat expiresAt (wedding_date + 30 hari).
 * Dipanggil otomatis oleh cron di server.js, atau bisa dijalankan manual
 * lewat `npm run cron:expire`.
 */
export async function runExpireJob() {
    const now = new Date();

    const expired = await prisma.invitation.findMany({
        where: { expiresAt: { lt: now }, status: { not: 'expired' } },
    });

    console.log(`[expire-job] Ditemukan ${expired.length} invitation yang sudah expired.`);

    for (const invitation of expired) {
        try {
            await deleteFolderFromR2(`invitations/${invitation.id}`);
        } catch (err) {
            console.error(`[expire-job] Gagal hapus file R2 untuk ${invitation.id}:`, err.message);
        }

        await prisma.invitation.delete({ where: { id: invitation.id } });
        console.log(`[expire-job] Invitation ${invitation.slug} (${invitation.id}) dihapus.`);
    }

    return expired.length;
}

// Kalau file ini dijalankan langsung lewat `node src/jobs/expireInvitations.js`
// (bukan di-import), jalankan sekali lalu exit. Berguna buat testing manual.
if (import.meta.url === `file://${process.argv[1]}`) {
    runExpireJob()
        .then((count) => {
            console.log(`Selesai. ${count} invitation dihapus.`);
            process.exit(0);
        })
        .catch((err) => {
            console.error('Gagal menjalankan expire job:', err);
            process.exit(1);
        });
}