import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma'; 

// --- 1. Buat Checkout (POST) ---
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Safety Check User 
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }
    const userId = user.id;

    const { customerId, items, paymentType } = req.body;

    // Validasi Cart Kosong
    if (!items || items.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'Cart is empty' });
    }

    const finalPayment = paymentType || "CASH";

    // --- MULAI TRANSAKSI ---
    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      
      // Array penampung item untuk bulk insert
      // Kita pake (any) ye biar Ts ga rewel
      const orderItemsData: any[] = []; 

      // Loop Barang
      for (const item of items) {
        // Cek Produk
        const product = await tx.product.findUnique({ where: { id: item.productId } });

        if (!product) {
          throw new Error(`Product ID ${item.productId} tidak ditemukan!`);
        }

        // Cek Stok
        if (product.stock < item.quantity) {
          throw new Error(`Stok ${product.name} kurang! (Sisa: ${product.stock}, Diminta: ${item.quantity})`);
        }

        // Hitung Subtotal
        const subtotal = Number(product.price) * item.quantity;
        totalAmount += subtotal;

        // Kurangi Stok (Update DB)
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity }
        });

        // Masukkan data ke memory array
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: Number(product.price) 
        });
      }

      // Generate Kode TRX Unik
      const trxCode = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Simpan Order ke DB
      const newOrder = await tx.order.create({
        data: {
          code: trxCode,
          userId: userId,
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

    res.status(201).json({ status: 'success', data: result });

  } catch (error: any) {
    if (error.message.includes('Product') || error.message.includes('Stok')) {
      return res.status(400).json({ status: 'fail', message: error.message });
    }
    next(error);
  }
};

// --- 2. Lihat Riwayat (GET) ---
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        customer: { select: { name: true, isMember: true } }, 
        items: { include: { product: { select: { name: true } } } }
      }
    });

    res.status(200).json({ status: 'success', data: orders });
  } catch (error) {
    next(error);
  }
};

// --- 3. Cetak Struk (POST/GET) ---
export const getOrderReceipt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
        customer: { select: { name: true, isMember: true } }, 
        items: {
          include: {
            product: { select: { name: true } }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    // Format Data Struk
    const receiptData = {
      shopName: "PEKONGFAM",
      address: "Jl. Permata Balaraja, Tangerang",
      date: order.createdAt.toLocaleString('id-ID'),
      receiptNo: order.code,     
      cashier: order.user?.name || "Kasir",
      customer: order.customer 
        ? `${order.customer.name} ${order.customer.isMember ? '(MEMBER)' : ''}` 
        : "Guest",
      
      items: order.items.map((item: any) => ({
        name: item.product.name,
        qty: item.quantity,
        price: Number(item.price),
        subtotal: item.quantity * Number(item.price)
      })),

      totalAmount: Number(order.totalAmount),
      paymentType: order.paymentType,
      footerMessage: "Terima Kasih, Datang Lagi Yaaa! :)"
    };

    res.status(200).json({ status: 'success', data: receiptData });

  } catch (error) {
    next(error);
  }
};