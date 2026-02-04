import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

// 1. Buat Checkout
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as any).id;
    const { customerId, items } = req.body; 
    // Format items: [{ productId: "...", quantity: 2 }]

    if (!items || items.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'Cart is empty' });
    }

    // Mulai Transaksi Db
    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      // Loop tiap item ntuk cek stok & hitung harga
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Stock tidak cukup untuk produk: ${product.name}`);
        }

        // Hitung subtotal
        const subtotal = Number(product.price) * item.quantity;
        totalAmount += subtotal;

        // Kurangi Stok
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity }
        });

        // Siapkan data untuk OrderItem
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price // Simpan harga saat transaksi terjadi
        });
      }

      // Buat Order Utama
      const newOrder = await tx.order.create({
        data: {
          userId,
          customerId: customerId || null,
          total: totalAmount,
          status: 'PAID', // Anggap aje kasir langsung terima uang
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: {
            include: { product: true }
          },
          customer: true,
          user: { select: { name: true } }
        }
      });

      return newOrder;
    });

    res.status(201).json({
      status: 'success',
      data: result
    });

  } catch (error: any) {
    // Capture error kalo stok/produk tidak ada
    if (error.message.includes('Stock') || error.message.includes('Product')) {
      return res.status(400).json({ status: 'fail', message: error.message });
    }
    next(error);
  }
};

// 2. Lihat Riwayat Transaksi
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true } },
        customer: true,
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ status: 'success', data: orders });
  } catch (error) {
    next(error);
  }
};