import { z } from 'zod';

export const createOrderSchema = z.object({
  customerId: z.string().optional(), // Boleh kosong kalo cust asal lewat
  paymentType: z.enum(['CASH', 'QRIS', 'TRANSFER']).default('CASH'),
  
  items: z.array(z.object({
    productId: z.string().uuid("ID Produk tidak valid"),
    quantity: z.number().min(1, "Minimal beli 1 barang")
  })).min(1, "Keranjang belanja tidak boleh kosong")
});