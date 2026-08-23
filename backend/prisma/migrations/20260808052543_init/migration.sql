-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('draft', 'published', 'expired');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('akad', 'resepsi');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('photo', 'video');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('pending', 'sent', 'opened');

-- CreateEnum
CREATE TYPE "GiftType" AS ENUM ('bank_transfer', 'address', 'both');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "theme_id" TEXT,
    "wedding_date" TIMESTAMP(3) NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'draft',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theme_settings" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "background" JSONB NOT NULL,
    "body_text" JSONB NOT NULL,
    "button" JSONB NOT NULL,
    "typography" JSONB NOT NULL,

    CONSTRAINT "theme_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couple_profiles" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "groom_name" TEXT NOT NULL,
    "groom_photo" TEXT,
    "groom_father" TEXT,
    "groom_mother" TEXT,
    "bride_name" TEXT NOT NULL,
    "bride_photo" TEXT,
    "bride_father" TEXT,
    "bride_mother" TEXT,

    CONSTRAINT "couple_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT,
    "end_time" TEXT,
    "venue_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "map_style_id" TEXT,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_media" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "layout_type" TEXT,

    CONSTRAINT "gallery_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_stories" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3),
    "photo_url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "timeline_stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "group_name" TEXT,
    "invite_status" "InviteStatus" NOT NULL DEFAULT 'pending',
    "sent_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rsvp_responses" (
    "id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "attending" BOOLEAN NOT NULL,
    "guest_count" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rsvp_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishes" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_settings" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "type" "GiftType" NOT NULL,
    "bank_name" TEXT,
    "account_number" TEXT,
    "account_holder" TEXT,
    "shipping_address" TEXT,

    CONSTRAINT "gift_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livestream_settings" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "platform" TEXT,
    "url" TEXT,

    CONSTRAINT "livestream_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation_features" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "rsvp_enabled" BOOLEAN NOT NULL DEFAULT true,
    "gift_enabled" BOOLEAN NOT NULL DEFAULT false,
    "livestream_enabled" BOOLEAN NOT NULL DEFAULT false,
    "timeline_enabled" BOOLEAN NOT NULL DEFAULT false,
    "story_enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "invitation_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_user_id_key" ON "invitations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_slug_key" ON "invitations"("slug");

-- CreateIndex
CREATE INDEX "invitations_expires_at_idx" ON "invitations"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "theme_settings_invitation_id_key" ON "theme_settings"("invitation_id");

-- CreateIndex
CREATE UNIQUE INDEX "couple_profiles_invitation_id_key" ON "couple_profiles"("invitation_id");

-- CreateIndex
CREATE UNIQUE INDEX "rsvp_responses_guest_id_key" ON "rsvp_responses"("guest_id");

-- CreateIndex
CREATE UNIQUE INDEX "gift_settings_invitation_id_key" ON "gift_settings"("invitation_id");

-- CreateIndex
CREATE UNIQUE INDEX "livestream_settings_invitation_id_key" ON "livestream_settings"("invitation_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_features_invitation_id_key" ON "invitation_features"("invitation_id");

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theme_settings" ADD CONSTRAINT "theme_settings_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_profiles" ADD CONSTRAINT "couple_profiles_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_media" ADD CONSTRAINT "gallery_media_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_stories" ADD CONSTRAINT "timeline_stories_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rsvp_responses" ADD CONSTRAINT "rsvp_responses_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishes" ADD CONSTRAINT "wishes_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_settings" ADD CONSTRAINT "gift_settings_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livestream_settings" ADD CONSTRAINT "livestream_settings_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation_features" ADD CONSTRAINT "invitation_features_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
