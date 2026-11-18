ALTER TABLE "illustration_wallets" ALTER COLUMN "granted" SET DEFAULT 3;
ALTER TABLE "illustration_wallets" ALTER COLUMN "remaining" SET DEFAULT 3;
-- Only initialize wallets that never received a quota, preserving all existing usage.
INSERT INTO "illustration_wallets" ("id", "invitation_id", "granted", "remaining")
SELECT gen_random_uuid()::text, i.id, 3, GREATEST(0, 3 - (SELECT count(*)::int FROM illustration_generations g WHERE g.invitation_id=i.id AND NOT g.refunded))
FROM invitations i WHERE NOT EXISTS (SELECT 1 FROM illustration_wallets w WHERE w.invitation_id=i.id);
UPDATE illustration_wallets w SET granted=3, remaining=GREATEST(0,3-(SELECT count(*)::int FROM illustration_generations g WHERE g.invitation_id=w.invitation_id AND NOT g.refunded)) WHERE w.granted=0;
