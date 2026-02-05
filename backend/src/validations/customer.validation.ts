import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(3, "Nama pelanggan minimal 3 huruf"),
  phone: z.string().min(10, "Nomor HP minimal 10 digit").optional().or(z.literal('')), 
  address: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();