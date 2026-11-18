ALTER TABLE "orders" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'PACKAGE';
CREATE TABLE "guest_desk_accesses" (
 "id" TEXT PRIMARY KEY,
 "invitation_id" TEXT NOT NULL REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "owner_id" TEXT NOT NULL,
 "label" TEXT NOT NULL,
 "token_hash" TEXT NOT NULL,
 "expires_at" TIMESTAMP(3) NOT NULL,
 "revoked_at" TIMESTAMP(3),
 "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "guest_desk_accesses_token_hash_key" ON "guest_desk_accesses"("token_hash");
CREATE INDEX "guest_desk_accesses_invitation_id_idx" ON "guest_desk_accesses"("invitation_id");
