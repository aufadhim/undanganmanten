UPDATE "invitations" SET "status"='archived' WHERE "status"='trashed';
CREATE TABLE "uploaded_assets" (
 "id" TEXT NOT NULL PRIMARY KEY, "owner_id" TEXT NOT NULL, "uploaded_for_id" TEXT NOT NULL,
 "invitation_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], "url" TEXT NOT NULL UNIQUE,
 "key" TEXT NOT NULL, "backend" TEXT NOT NULL, "bytes" INTEGER NOT NULL,
 "state" TEXT NOT NULL DEFAULT 'reserved', "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "uploaded_assets_owner_id_idx" ON "uploaded_assets"("owner_id");
