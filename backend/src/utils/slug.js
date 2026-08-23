import { prisma } from '../lib/prisma.js';

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

/**
 * Generate slug unik dari nama, contoh: "Rea", "David" -> "rea-david"
 * Kalau sudah dipakai, tambahin angka random di belakang: "rea-david-4821"
 */
export async function generateUniqueSlug(baseName) {
    const base = slugify(baseName) || 'undangan';
    let slug = base;
    let attempt = 0;

    while (true) {
        const existing = await prisma.invitation.findUnique({ where: { slug } });
        if (!existing) return slug;

        attempt += 1;
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        slug = `${base}-${randomSuffix}`;

        if (attempt > 10) {
            // fallback super aman kalau somehow terus bentrok
            slug = `${base}-${Date.now()}`;
            return slug;
        }
    }
}