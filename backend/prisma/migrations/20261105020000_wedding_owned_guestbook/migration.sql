CREATE TABLE "wedding_addons" (
 "id" TEXT PRIMARY KEY,
 "wedding_id" TEXT NOT NULL REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "addon" TEXT NOT NULL,
 "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "revoked_at" TIMESTAMP(3)
);
CREATE UNIQUE INDEX "wedding_addons_wedding_id_addon_key" ON "wedding_addons"("wedding_id","addon");
-- Preserve previously activated QR purchases; no invitation or payment records changed.
INSERT INTO "wedding_addons" ("id","wedding_id","addon")
SELECT 'qr-' || i.wedding_id, i.wedding_id, 'QR_GUESTBOOK'
FROM orders o JOIN invitations i ON i.id=o.invitation_id
WHERE i.wedding_id IS NOT NULL AND o.status='SUCCESS' AND o.addons::jsonb @> '["QR_GUESTBOOK"]'::jsonb
GROUP BY i.wedding_id ON CONFLICT DO NOTHING;
