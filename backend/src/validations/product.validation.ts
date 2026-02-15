import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  price: z.number().min(5000),
  stock: z.number().min(0),
  category: z.enum(['MAKANAN', 'MINUMAN', 'SNACK', 'JASA', 'LAINNYA']),
  imageUrl: z.string().optional().nullable()

});

export const updateProductSchema = createProductSchema.partial();
