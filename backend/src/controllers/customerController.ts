import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

// 1. Add Cust Baru
export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, address } = req.body;

    const customer = await prisma.customer.create({
      data: { name, phone, address }
    });

    res.status(201).json({
      status: 'success',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// 2. Ambl Semua Cust
export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      data: customers
    });
  } catch (error) {
    next(error);
  }
};