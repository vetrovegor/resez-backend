/*
  Warnings:

  - You are about to drop the column `sendAt` on the `notifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "sendAt",
ADD COLUMN     "send_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "author" DROP NOT NULL;
