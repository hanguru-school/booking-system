-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "accountHolder" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "addressDetail" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "emergencyRelation" TEXT,
ADD COLUMN     "englishName" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "transportation" JSONB DEFAULT '[]';
