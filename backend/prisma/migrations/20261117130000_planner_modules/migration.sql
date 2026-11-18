ALTER TABLE "wedding_planner_tasks"
  ADD COLUMN "category" TEXT NOT NULL DEFAULT 'Umum',
  ADD COLUMN "owner" TEXT NOT NULL DEFAULT '';

CREATE TABLE "wedding_planner_entries" (
  "id" TEXT PRIMARY KEY,
  "wedding_id" TEXT NOT NULL REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "module" TEXT NOT NULL,
  "details" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "wedding_planner_entries_wedding_id_module_idx" ON "wedding_planner_entries" ("wedding_id", "module");
