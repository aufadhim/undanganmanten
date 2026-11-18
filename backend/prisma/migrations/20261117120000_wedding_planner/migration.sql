CREATE TABLE "wedding_planner_tasks" (
    "id" TEXT PRIMARY KEY,
    "wedding_id" TEXT NOT NULL REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "preset" TEXT,
    "title" VARCHAR(140) NOT NULL,
    "due_date" DATE NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    UNIQUE ("wedding_id", "preset")
);
CREATE INDEX "wedding_planner_tasks_wedding_id_due_date_idx" ON "wedding_planner_tasks" ("wedding_id", "due_date");
