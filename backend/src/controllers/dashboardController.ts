import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database'; 

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalRevenue, totalOrders, lowStockCount, recentOrders] = await Promise.all([
      
      // 1. Hitung Total Omsetnye
      prisma.order.aggregate({
        _sum: { totalAmount: true }
      }),

      // 2. Hitung Total Transaksi
      prisma.order.count(),

      // 3. Hitung Produk yang Stoknya Menipis 
      prisma.product.count({
        where: { stock: { lte: 5 } }
      }),

      // 4. Ambil 5 Transaksi Terakhir 
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } } // Siapa kasirnya?
        }
      })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalRevenue: totalRevenue._sum.totalAmount || 0, // Handle kalau belum ada data (null aja lah ye)
        totalOrders,
        lowStockAlert: lowStockCount,
        recentOrders
      }
    });

  } catch (error) {
    next(error);
  }
};