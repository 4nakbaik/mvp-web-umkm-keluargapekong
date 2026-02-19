import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();

    // 1. Revenue
    const revenue = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: 'PAID' }
    });

    // 2. Total Orders
    const totalOrders = await prisma.order.count({
      where: { status: 'PAID' }
    });

    // 3. Low Stock Products
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lt: 10 } },
      select: { id: true, name: true, stock: true },
      take: 5,
      orderBy: { stock: 'asc' }
    });

    // 4. Count Active Vouchers
    const activeVouchersCount = await prisma.voucher.count({
      where: {
        isActive: true,
        endDate: { gte: now }
      }
    });

    // 5. Count Expired Vouchers
    const expiredVouchersCount = await prisma.voucher.count({
      where: {
        endDate: { lt: now }
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalRevenue: revenue._sum.totalAmount || 0,
        totalOrders,
        lowStockProducts,
        activeVouchersCount,
        expiredVouchersCount
      }
    });
  } catch (error) {
    next(error);
  }
};