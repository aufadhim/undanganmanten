ALTER TABLE "theme_settings" ADD COLUMN "character_settings" JSONB;
CREATE TABLE "illustration_requests" (
 "id" TEXT NOT NULL PRIMARY KEY, "invitation_id" TEXT NOT NULL UNIQUE,
 "status" TEXT NOT NULL DEFAULT 'submitted', "references" JSONB NOT NULL,
 "brief" TEXT NOT NULL, "result_cover" TEXT, "result_hero" TEXT, "admin_note" TEXT,
 "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updated_at" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "illustration_requests_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
