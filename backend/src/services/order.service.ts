import prisma from '../config/database';

export const createOrderService = async (userId: string, data: any) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Hitung Total & Validasi Stok Dlu
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of data.items) {
      // Ambil data produk terbaru dari DB
      const product = await tx.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Stok ${product.name} tidak cukup (Sisa: ${product.stock})`);
      }

      // Hitung subtotal
      const subtotal = Number(product.price) * item.quantity;
      totalAmount += subtotal;

      // Siapin data tuk disimpen ke tabel OrderItem
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price 
      });
    }

    // 2. Generate Kode Transaksi
    const code = `TRX-${Date.now()}`;

    // 3. Simpan Order Utama
    const newOrder = await tx.order.create({
      data: {
        code: code,
        totalAmount: totalAmount,
        paymentType: data.paymentType,
        userId: userId, // <--Staff yg login
        customerId: data.customerId || null,
        items: {
          create: orderItemsData // 
        }
      },
      include: { items: true } // Return data sekalian itemsnye
    });

    // 4. Kurangi Stok Produk (Update Stock)
    for (const item of data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity // Kurangi stok otomatis
          }
        }
      });
    }

    return newOrder;
  });
};