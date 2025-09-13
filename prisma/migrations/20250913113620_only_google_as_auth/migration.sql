/*
  Warnings:

  - You are about to drop the column `userId` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the `AuthenticationMethod` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `UserProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `googleId` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AuthenticationMethod" DROP CONSTRAINT "AuthenticationMethod_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_userId_fkey";

-- DropIndex
DROP INDEX "UserProfile_userId_key";

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "userId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "googleId" TEXT NOT NULL;

-- DropTable
DROP TABLE "AuthenticationMethod";

-- DropTable
DROP TABLE "User";

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_googleId_key" ON "UserProfile"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");
