import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  description: z.string().optional(),
  price: z.number({ invalid_type_error: "Harga harus angka" }).min(5000, "Harga minimal 5000"),
  stock: z.number({ invalid_type_error: "Stok harus angka" }).min(0, "Stok tidak boleh minus"),
  category: z.enum(["MAKANAN", "MINUMAN", "SNACK", "JASA", "LAINNYA"]),
  imageUrl: z.string().url({ message: "URL gambar tidak valid" }).optional(),
});

export const updateProductSchema = createProductSchema.partial();