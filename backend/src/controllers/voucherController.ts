import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createVoucherSchema } from '../utils/schemas';

// --- 1. Create NW Voucher ---
export const createVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validasi Input pakai Zod
    const validatedData = createVoucherSchema.parse(req.body);

    // Cek apakah kode sudah ada (Unik)
    const existingVoucher = await prisma.voucher.findUnique({
      where: { code: validatedData.code }
    });

    if (existingVoucher) {
      return res.status(400).json({ message: 'Kode voucher sudah ada!' });
    }

    const voucher = await prisma.voucher.create({
      data: validatedData
    });

    res.status(201).json({ status: 'success', data: voucher });
  } catch (error) {
    next(error);
  }
};

// --- 2. Lihat Semua Voucher ---
export const getVouchers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query; 
    
    let whereClause: any = {};
    const now = new Date();

    if (status === 'active') {
      whereClause = {
        isActive: true,
        endDate: { gte: now }, 
        startDate: { lte: now } 
      };
    } else if (status === 'expired') {
      whereClause = {
        endDate: { lt: now } 
      };
    }
    // Kalau status kosong, tampilkan semua (History)

    const vouchers = await prisma.voucher.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ status: 'success', data: vouchers });
  } catch (error) {
    next(error);
  }
};

// --- 3. Update Voucher ---
export const updateVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = createVoucherSchema.partial().parse(req.body); 

    const voucher = await prisma.voucher.update({
      where: { id },
      data: validatedData
    });

    res.status(200).json({ status: 'success', data: voucher });
  } catch (error) {
    next(error); // Kalau ID gak ketemu, Prisma otomatis lempar error
  }
};

// --- 4. Hapus Voucher ---
export const deleteVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.voucher.delete({ where: { id } });
    res.status(200).json({ status: 'success', message: 'Voucher deleted' });
  } catch (error) {
    next(error);
  }
};