ALTER TABLE "illustration_generations" ADD COLUMN "owner_id" TEXT;
UPDATE "illustration_generations" g SET "owner_id"=i."user_id" FROM "invitations" i WHERE g."invitation_id"=i.id;
ALTER TABLE "illustration_generations" ALTER COLUMN "owner_id" SET NOT NULL;
ALTER TABLE "illustration_generations" DROP CONSTRAINT "illustration_generations_invitation_id_fkey";
ALTER TABLE "illustration_generations" ALTER COLUMN "invitation_id" DROP NOT NULL;
ALTER TABLE "illustration_generations" ADD CONSTRAINT "illustration_generations_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
