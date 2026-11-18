import { createHash, randomUUID } from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { guestScope } from '../utils/weddingGuests.js';

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const hash = value => createHash('sha256').update(value).digest('hex');
const denied = 'Tautan pribadi ini sudah aktif di browser lain. Hubungi pengirim jika Anda berganti perangkat.';
const missing = 'Mintalah tautan pribadi yang masih berlaku dari pengirim undangan.';

export async function publicGuestAccess(req, res, next) {
    res.set('Cache-Control', 'private, no-store');
    res.set('Cloudflare-CDN-Cache-Control', 'no-store');
    try {
        const invitation = await prisma.invitation.findUnique({
            where: { slug: req.params.slug },
            include: { user: { select: { suspendedAt: true } }, coupleProfile: { select: { brideName: true, groomName: true } } },
        });
        if (!invitation || invitation.status !== 'published' ||
            new Date(invitation.expiresAt) <= new Date() || invitation.suspendedAt || invitation.user?.suspendedAt) {
            return res.status(404).json({ error: 'Undangan tidak ditemukan.' });
        }
        const token = req.params.guestId || req.query.g || req.query.code;
        let guest;
        if (typeof token === 'string' && uuid.test(token)) {
            guest = await prisma.guest.findFirst({
                where: { ...guestScope(invitation), AND: [{ OR: [
                    { browserAccess: { some: { invitationId: invitation.id, linkToken: token } } },
                    { id: token, browserAccess: { none: { invitationId: invitation.id, linkToken: { not: null } } } },
                ] }] },
                include: { rsvp: { select: { attending: true, guestCount: true, note: true } } },
            });
        }
        const name = 'samavaya_guest_' + invitation.id;
        const secret = req.headers.cookie?.split(';').map(part => part.trim())
            .find(part => part.startsWith(name + '='))?.slice(name.length + 1);
        const validSecret = uuid.test(secret || '');
        const access = validSecret && (!token || guest) && await prisma.guestBrowserAccess.findFirst({
            where: { invitationId: invitation.id, browserHash: hash(secret), ...(guest ? { guestId: guest.id } : {}) },
        });
        const authorized = Boolean(access);
        const route = req.route.path;

        if (route.endsWith('/access')) {
            if (!req.is('application/json')) return res.sendStatus(415);
            if (!guest) return res.status(404).json({ error: missing });
            if (!invitation.browserLock || authorized) return res.json({ opened: true });

            const newSecret = validSecret ? secret : randomUUID();
            const rows = await prisma.$queryRaw`
                INSERT INTO "GuestBrowserAccess" ("invitationId", "guestId", "browserHash")
                SELECT ${invitation.id}, ${guest.id}, ${hash(newSecret)}
                WHERE ${token} = ${guest.id}
                   OR EXISTS (
                      SELECT 1 FROM "GuestBrowserAccess"
                      WHERE "invitationId" = ${invitation.id} AND "guestId" = ${guest.id} AND "linkToken" = ${token}
                   )
                ON CONFLICT ("invitationId", "guestId") DO UPDATE
                SET "browserHash" = EXCLUDED."browserHash"
                WHERE "GuestBrowserAccess"."browserHash" IS NULL
                  AND COALESCE("GuestBrowserAccess"."linkToken", "GuestBrowserAccess"."guestId") = ${token}
                RETURNING "guestId"
            `;
            if (!rows.length) return res.status(409).json({ error: denied });

            res.cookie(name, newSecret, {
                httpOnly: true, sameSite: 'lax', secure: req.secure,
                path: '/api/invitations/public/' + encodeURIComponent(invitation.slug),
                expires: new Date(invitation.expiresAt),
            });
            return res.json({ opened: true });
        }

        if (invitation.browserLock && (!authorized || (route === '/public/:slug' && !token))) {
            if (route === '/public/:slug') {
                const binding = guest && await prisma.guestBrowserAccess.findUnique({
                    where: { invitationId_guestId: { invitationId: invitation.id, guestId: guest.id } },
                    select: { browserHash: true },
                });
                return res.json({ locked: {
                    profile: invitation.coupleProfile,
                    guestName: guest?.name,
                    canOpen: Boolean(guest && !binding?.browserHash),
                    message: binding?.browserHash ? denied : missing,
                } });
            }
            return res.status(403).json({ error: guest ? denied : missing });
        }
        if (token && !guest) return res.status(404).json({ error: missing });
        req.publicInvitationId = invitation.id;
        req.publicGuest = guest;
        if (guest && req.params.guestId) req.params.guestId = guest.id;
        if (req.method === 'POST' && (guest || invitation.browserLock)) {
            req.query.g = guest?.id || access.guestId;
        }
        return next();
    } catch (error) {
        return next(error);
    }
}
