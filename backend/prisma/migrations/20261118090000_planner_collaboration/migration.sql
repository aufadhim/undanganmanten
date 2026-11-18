
ALTER TABLE "weddings" ADD COLUMN "planner_settings" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "wedding_planner_tasks" ADD COLUMN "updated_by" TEXT NOT NULL DEFAULT '', ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "wedding_planner_entries" ADD COLUMN "updated_by" TEXT NOT NULL DEFAULT '', ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE TABLE "planner_members" ("id" TEXT PRIMARY KEY,"wedding_id" TEXT NOT NULL REFERENCES "weddings"("id") ON DELETE CASCADE,"email" TEXT NOT NULL,"user_id" TEXT,"token_hash" TEXT NOT NULL UNIQUE,"expires_at" TIMESTAMP(3) NOT NULL,"accepted_at" TIMESTAMP(3), UNIQUE("wedding_id","email"));
CREATE INDEX "planner_members_user_id_idx" ON "planner_members"("user_id");
CREATE TABLE "planner_shares" ("id" TEXT PRIMARY KEY,"wedding_id" TEXT NOT NULL REFERENCES "weddings"("id") ON DELETE CASCADE,"token_hash" TEXT NOT NULL UNIQUE,"expires_at" TIMESTAMP(3) NOT NULL);
CREATE INDEX "planner_shares_wedding_id_idx" ON "planner_shares"("wedding_id");
