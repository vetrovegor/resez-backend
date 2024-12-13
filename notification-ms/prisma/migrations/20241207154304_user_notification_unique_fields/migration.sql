/*
  Warnings:

  - The primary key for the `user_notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "user_notifications" DROP CONSTRAINT "user_notifications_pkey",
ADD CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("notification_id", "user_id");
