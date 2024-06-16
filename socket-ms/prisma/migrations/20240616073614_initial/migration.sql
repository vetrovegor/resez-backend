-- CreateEnum
CREATE TYPE "Type" AS ENUM ('Login', 'Logout');

-- CreateTable
CREATE TABLE "activity" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "Type" NOT NULL,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);
