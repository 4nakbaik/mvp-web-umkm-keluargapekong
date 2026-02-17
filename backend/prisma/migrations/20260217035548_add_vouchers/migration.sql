-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('FIXED', 'PERCENT');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "taxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "voucherId" TEXT;

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "minPurchase" DECIMAL(10,2),
    "maxDiscount" DECIMAL(10,2),
    "quota" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
