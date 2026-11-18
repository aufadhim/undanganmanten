// Trial is an editable draft, not a timed public subscription.
export function invitationStatus(inv = {}, now = new Date()) {
 if (['archived', 'trashed'].includes(inv.status)) return 'archived';
 if (inv.packageType === 'TRIAL') return 'draft';
 if (inv.status === 'expired' || (inv.expiresAt && new Date(inv.expiresAt) <= now)) return 'expired';
 return inv.status === 'published' ? 'published' : 'draft';
}
export function invitationStatusLabel(inv, now) {
 return {draft:'Draft', published:'Terbit', expired:'Masa aktif berakhir', archived:'Diarsipkan'}[invitationStatus(inv, now)];
}
