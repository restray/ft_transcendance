/*
  Warnings:

  - A unique constraint covering the columns `[intra_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otp_secret" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_intra_id_key" ON "User"("intra_id");
