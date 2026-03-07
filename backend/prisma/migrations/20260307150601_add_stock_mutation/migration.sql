-- CreateEnum
CREATE TYPE "MutationType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "StockMutation" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "MutationType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "remainingStock" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMutation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StockMutation" ADD CONSTRAINT "StockMutation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMutation" ADD CONSTRAINT "StockMutation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
