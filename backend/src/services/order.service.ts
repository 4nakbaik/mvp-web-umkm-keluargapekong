import prisma from '../utils/prisma';

interface OrderItemInput {
  productId: string;
  quantity: number;
}

export const createOrderService = async (userId: string, items: OrderItemInput[]) => {
  return await prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    
    // FIX 1: Array kita beri tipe any[] agar tidak error 'never'
    const orderItemsData: any[] = []; 

    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Stock habis untuk produk: ${product.name}`);
      }

      // Kurangi Stok
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });

      // Hitung Subtotal
      const subtotal = Number(product.price) * item.quantity;
      totalAmount += subtotal;

      // Push ke array
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(product.price) // Pastikan number
      });
    }

    // FIX 2: Generate Kode Transaksi Unik (Wajib ada!)
    // Format: TRX-TIMESTAMP-RANDOM (Contoh: TRX-1708123456-999)
    const transactionCode = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Buat Order
    const order = await tx.order.create({
      data: {
        code: transactionCode, // <--- INI YANG TADI HILANG (Penyebab Error)
        userId,
        totalAmount,
        paymentType: 'CASH',
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    return order;
  });
};
