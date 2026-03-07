import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import * as ExcelJS from 'exceljs';

export const exportStockMutationsExcel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. EXTRACT: Ambil raw data
    const mutations = await prisma.stockMutation.findMany({
      include: {
        product: { select: { name: true } },
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. TRANSFORM: Buat agregasi data (Pivot)/Produk
    const summaryMap: Record<string, { in: number; out: number }> = {};
    
    mutations.forEach(m => {
      const pName = m.product.name;
      if (!summaryMap[pName]) summaryMap[pName] = { in: 0, out: 0 };
      
      if (m.type === 'IN') summaryMap[pName].in += m.quantity;
      if (m.type === 'OUT') summaryMap[pName].out += m.quantity;
    });

    const workbook = new ExcelJS.Workbook();

    // 3. LOAD: Sheet 1 (Summary Layer)
    const summarySheet = workbook.addWorksheet('Summary Analytics');
    summarySheet.columns = [
      { header: 'Nama Produk', key: 'productName', width: 30 },
      { header: 'Total Masuk (IN)', key: 'totalIn', width: 20 },
      { header: 'Total Keluar (OUT)', key: 'totalOut', width: 20 },
      { header: 'Net Flow', key: 'netFlow', width: 15 }
    ];
    summarySheet.getRow(1).font = { bold: true };

    Object.entries(summaryMap).forEach(([name, data]) => {
      summarySheet.addRow({
        productName: name,
        totalIn: data.in,
        totalOut: data.out,
        netFlow: data.in - data.out
      });
    });

    // 4. LOAD: Sheet 2 (Raw Layer)
    const rawSheet = workbook.addWorksheet('Raw Mutations');
    rawSheet.columns = [
      { header: 'Waktu Transaksi', key: 'createdAt', width: 22 },
      { header: 'Nama Produk', key: 'productName', width: 30 },
      { header: 'Tipe Mutasi', key: 'type', width: 15 },
      { header: 'Qty', key: 'quantity', width: 10 },
      { header: 'Sisa Stok', key: 'remainingStock', width: 15 },
      { header: 'Kasir/Admin', key: 'userName', width: 20 },
      { header: 'Keterangan', key: 'description', width: 40 }
    ];
    rawSheet.getRow(1).font = { bold: true };

    mutations.forEach(m => {
      rawSheet.addRow({
        createdAt: m.createdAt.toLocaleString('id-ID'),
        productName: m.product.name,
        type: m.type,
        quantity: m.type === 'OUT' ? `-${m.quantity}` : `+${m.quantity}`,
        remainingStock: m.remainingStock,
        userName: m.user.name,
        description: m.description || '-'
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Laporan_Stok_Analytics_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    next(error);
  }
};