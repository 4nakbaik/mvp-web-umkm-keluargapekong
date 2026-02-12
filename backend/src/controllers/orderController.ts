import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma'; 

// 1. Buat Checkout (POST)
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as any).id; 
    const { customerId, items, paymentType } = req.body; 

    // Validasi Cart Kosong
    if (!items || items.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'Cart is empty' });
    }

    // Default Payment Type kalau kosong
    const finalPayment = paymentType || "CASH";

    // --- MULAI TRANSAKSI ---
    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      // 1. Loop Barang
      for (const item of items) {
        // Cek Produk Ada Ora?
        const product = await tx.product.findUnique({ where: { id: item.productId } });

        if (!product) {
          throw new Error(`Product ID ${item.productId} tidak ditemukan!`);
        }

        // Cek Stok Cukup Ra?
        if (product.stock < item.quantity) {
          throw new Error(`Stok ${product.name} habis/kurang! (Sisa: ${product.stock})`);
        }

        // Hitung Subtotal
        const subtotal = Number(product.price) * item.quantity;
        totalAmount += subtotal;

        // Kurangi Stok
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity }
        });

        // Simpan ke Array Item
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price 
        });
      }

      // 2. Generate Kode Transaksi Unik Biar Ra bentrok
      const trxCode = `TRX-${Date.now()}`; 

      // 3. Simpen ke Db
      const newOrder = await tx.order.create({
        data: {
          code: trxCode,            
          userId,
          customerId: customerId || null,
          totalAmount: totalAmount, 
          paymentType: finalPayment, 
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: { include: { product: true } }, 
          user: { select: { name: true } }      
        }
      });

      return newOrder;
    });

    // Respon Sukses
    res.status(201).json({
      status: 'success',
      data: result
    });

  } catch (error: any) {
    // Tangkap Error Validasi (stok/id nye salah)
    if (error.message.includes('Product') || error.message.includes('Stok')) {
      return res.status(400).json({ status: 'fail', message: error.message });
    }
    next(error);
  }
};

// 2. Lihat Riwayat (GET)
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        items: { include: { product: { select: { name: true } } } }
      }
    });

    // Kalau kosong, ini bakal return data: []
    res.status(200).json({ status: 'success', data: orders });
  } catch (error) {
    next(error);
  }
};