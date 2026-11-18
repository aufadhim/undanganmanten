ALTER TABLE "users" ADD COLUMN "suspended_at" TIMESTAMP(3), ADD COLUMN "suspension_reason" TEXT;
ALTER TABLE "invitations" ADD COLUMN "suspended_at" TIMESTAMP(3), ADD COLUMN "suspension_reason" TEXT;
ALTER TABLE "orders" ADD COLUMN "activation_source" TEXT NOT NULL DEFAULT 'gateway', ADD COLUMN "activation_reason" TEXT;
CREATE TABLE "admin_audit_logs" ("id" TEXT NOT NULL PRIMARY KEY,"actor_id" TEXT NOT NULL,"action" TEXT NOT NULL,"target_type" TEXT NOT NULL,"target_id" TEXT NOT NULL,"reason" TEXT NOT NULL,"before" JSONB,"after" JSONB,"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "admin_audit_logs_created_at_idx" ON "admin_audit_logs"("created_at");
CREATE INDEX "admin_audit_logs_target_id_idx" ON "admin_audit_logs"("target_id");
CREATE TABLE "template_availability" ("id" TEXT NOT NULL PRIMARY KEY,"hidden" BOOLEAN NOT NULL DEFAULT false,"updated_at" TIMESTAMP(3) NOT NULL);
