/*
  Warnings:

  - You are about to drop the column `googleId` on the `UserProfile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "UserProfile_googleId_key";

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "googleId";
