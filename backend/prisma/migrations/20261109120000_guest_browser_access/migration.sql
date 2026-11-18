ALTER TABLE "invitations" ADD COLUMN "browserLock" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "GuestBrowserAccess" (
  "invitationId" TEXT NOT NULL REFERENCES "invitations"("id") ON DELETE CASCADE,
  "guestId" TEXT NOT NULL REFERENCES "guests"("id") ON DELETE CASCADE,
  "linkToken" TEXT UNIQUE,
  "browserHash" TEXT,
  PRIMARY KEY ("invitationId", "guestId")
);
CREATE INDEX "GuestBrowserAccess_guestId_idx" ON "GuestBrowserAccess"("guestId");

CREATE INDEX "GuestBrowserAccess_invitationId_browserHash_idx" ON "GuestBrowserAccess"("invitationId", "browserHash");

