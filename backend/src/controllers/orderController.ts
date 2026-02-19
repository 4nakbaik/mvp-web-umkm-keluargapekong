import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import QRCode from 'qrcode'; 

// --- 1. Buat Checkout (POST) ---
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Safety Check User 
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }
    const userId = user.id;

    // Ambil voucherCode dari body
    const { customerId, items, paymentType, voucherCode } = req.body;

    // Validasi Cart Kosong
    if (!items || items.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'Cart is empty' });
    }

    const finalPayment = paymentType || "CASH";

    // --- MULAI TRANSAKSI ---
    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      
      // Array penampung item untuk bulk insert
      const orderItemsData: any[] = []; 

      // 1. Loop Barang & Hitung Subtotal
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

        // Hitung Subtotal Item
        const itemPrice = Number(product.price);
        const itemSubtotal = itemPrice * item.quantity;
        subtotal += itemSubtotal;

        // Kurangi Stok (Update DB)
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity }
        });

        // Masukkan data ke memory array
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: itemPrice
        });
      }

      // 2. Logic Voucher (Diskon)
      let discountAmount = 0;
      let usedVoucherId: string | null = null;

      if (voucherCode) {
        const voucher = await tx.voucher.findUnique({ where: { code: voucherCode } });

        // Validasi Ketersediaan Voucher
        if (!voucher) throw new Error('Voucher tidak ditemukan');
        if (!voucher.isActive) throw new Error('Voucher sedang tidak aktif');
        
        // Validasi Kuota
        if (voucher.quota !== null && voucher.usageCount >= voucher.quota) {
          throw new Error('Kuota voucher sudah habis');
        }

        // Validasi Tanggal
        const now = new Date();
        if (voucher.startDate && now < voucher.startDate) throw new Error('Voucher belum dimulai');
        if (voucher.endDate && now > voucher.endDate) throw new Error('Voucher sudah kadaluarsa');

        // Validasi Minimal Belanja
        if (voucher.minPurchase && subtotal < Number(voucher.minPurchase)) {
          throw new Error(`Minimal belanja Rp ${Number(voucher.minPurchase).toLocaleString('id-ID')}`);
        }

        // Hitung Nilai Diskon
        if (voucher.type === 'FIXED') {
          discountAmount = Number(voucher.value);
        } else if (voucher.type === 'PERCENT') {
          discountAmount = subtotal * (Number(voucher.value) / 100);
          // Cek Max Discount (Cap)
          if (voucher.maxDiscount && discountAmount > Number(voucher.maxDiscount)) {
            discountAmount = Number(voucher.maxDiscount);
          }
        }

        if (discountAmount > subtotal) discountAmount = subtotal;
        
        usedVoucherId = voucher.id;

        // Increment usage count voucher
        await tx.voucher.update({
          where: { id: voucher.id },
          data: { usageCount: { increment: 1 } }
        });
      }

      // 3. Logic Pajak 
      const taxRate = 0.11; 
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = taxableAmount * taxRate;

      // 4. Hitung Grand Total
      const totalAmount = taxableAmount + taxAmount;

      // 5. Generate Kode TRX & QR Code
      const trxCode = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Generate QR Base64 (Isinya link verifikasi/Kode TRX)
      const qrData = trxCode; 
      const qrCodeBase64 = await QRCode.toDataURL(qrData);

      // 6. Simpan Order ke DB
      const newOrder = await tx.order.create({
        data: {
          code: trxCode,
          userId: userId,
          customerId: customerId || null, 
          
          // Data Keuangan
          subtotal: subtotal,
          discountAmount: discountAmount,
          taxAmount: taxAmount,
          totalAmount: totalAmount,
          
          paymentType: finalPayment,
          voucherId: usedVoucherId, 

          items: {
            create: orderItemsData 
          }
        },
        include: {
          items: { include: { product: true } },
          user: { select: { name: true } },
          voucher: { select: { code: true, type: true, value: true } }
        }
      });

      // Return order + QR Code agar frontend bisa langsung display
      return { ...newOrder, qrCode: qrCodeBase64 };
    });

    res.status(201).json({ status: 'success', data: result });

  } catch (error: any) {
    // Error handling spesifik untuk pesan ke frontend
    if (error.message.includes('Product') || error.message.includes('Stok') || error.message.includes('Voucher') || error.message.includes('Minimal')) {
      return res.status(400).json({ status: 'fail', message: error.message });
    }
    next(error);
  }
};

// --- 2. History (GET) ---
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query; 

    const orders = await prisma.order.findMany({
      where: status ? { status: status as any } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        customer: { select: { name: true, isMember: true } }, 
        voucher: { select: { code: true } },
        items: { include: { product: { select: { name: true } } } }
      }
    });

    res.status(200).json({ status: 'success', data: orders });
  } catch (error) {
    next(error);
  }
};

// --- 3. Update Status (PUT) ---
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    // Validasi input status (Biar gak ngasal stringnye)
    if (!['PENDING', 'PAID', 'CANCELLED', 'FAILED'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: status as any }
    });

    res.status(200).json({ status: 'success', data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// --- 4. Print Struk (POST/GET) ---
export const getOrderReceipt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
        customer: { select: { name: true, isMember: true } }, 
        voucher: { select: { code: true } },
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

    // Generate QR Code on-the-fly untuk struk
    const qrCodeBase64 = await QRCode.toDataURL(order.code);

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

      // Rincian Keuangan
      subtotal: Number(order.subtotal),
      discount: Number(order.discountAmount), // Tampilkan diskon
      voucherCode: order.voucher?.code || "-",
      tax: Number(order.taxAmount),           // Tampilkan pajak
      
      totalAmount: Number(order.totalAmount),
      paymentType: order.paymentType,
      
      qrCode: qrCodeBase64, // Data QR Image
      footerMessage: "Terima Kasih, Datang Lagi Yaaaa! :)"
    };

    res.status(200).json({ status: 'success', data: receiptData });

  } catch (error) {
    next(error);
  }
};