/*
  Warnings:

  - You are about to drop the column `status` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "status",
DROP COLUMN "total",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "paymentType" TEXT NOT NULL DEFAULT 'CASH',
ADD COLUMN     "totalAmount" DECIMAL(10,2) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_code_key" ON "Order"("code");
