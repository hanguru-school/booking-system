/*
  Warnings:

  - You are about to drop the column `permissions` on the `staff` table. All the data in the column will be lost.
  - Added the required column `department` to the `staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salary` to the `staff` table without a default value. This is not possible if the table is not empty.
  - Made the column `hireDate` on table `staff` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "staff" DROP COLUMN "permissions",
ADD COLUMN     "accountHolder" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "addressDetail" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "department" TEXT NOT NULL,
ADD COLUMN     "emergencyRelation" TEXT,
ADD COLUMN     "englishName" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "salary" INTEGER NOT NULL,
ADD COLUMN     "transportation" JSONB DEFAULT '[]',
ALTER COLUMN "hireDate" SET NOT NULL,
ALTER COLUMN "hireDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "addressDetail" TEXT,
ADD COLUMN     "emergencyRelation" TEXT,
ADD COLUMN     "postalCode" TEXT;

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "accountHolder" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "addressDetail" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "emergencyRelation" TEXT,
ADD COLUMN     "englishName" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "transportation" JSONB DEFAULT '[]';
