ALTER TABLE "invitations"
  ADD COLUMN "rsvp_deadline" TIMESTAMP(3),
  ADD COLUMN "rsvp_open_to_public" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "guests"
  ADD COLUMN "pax_limit" INTEGER NOT NULL DEFAULT 2;

ALTER TABLE "gift_settings"
  ADD COLUMN "bank_accounts" JSONB;

ALTER TABLE "invitation_features"
  ADD COLUMN "wishes_enabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "wishes_moderation_enabled" BOOLEAN NOT NULL DEFAULT false;
