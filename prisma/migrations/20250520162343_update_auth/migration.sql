/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_key" ON "Membership"("userId");
