import { z } from 'zod';

export const createVoucherSchema = z.object({
  code: z.string().min(3, "Kode minimal 3 karakter").toUpperCase(),
  type: z.enum(["FIXED", "PERCENT"]),
  value: z.number().min(0, "Nilai tidak boleh minus"),
  minPurchase: z.number().optional(),
  maxDiscount: z.number().optional(),
  quota: z.number().optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
  isActive: z.boolean().optional()
  
}).refine((data) => {
  if (data.type === 'PERCENT' && data.value > 100) {
    return false; // Diskon persen gak boleh lebih dari 100%
  }
  return true;
}, {
  message: "Nilai diskon persen tidak boleh lebih dari 100",
  path: ["value"]
});