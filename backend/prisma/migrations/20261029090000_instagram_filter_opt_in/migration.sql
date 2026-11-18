-- Default only: existing customer choices remain unchanged.
ALTER TABLE "invitation_features" ALTER COLUMN "ig_filter_enabled" SET DEFAULT false;
