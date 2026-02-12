import { Request, Response, NextFunction } from 'express';
import * as customerService from '../services/customer.service';
import { createCustomerSchema, updateCustomerSchema } from '../validations/customer.validation';
// import prisma from '../config/database';
import prisma from '../utils/prisma';

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await customerService.getAllCustomersService();
    res.status(200).json({ status: 'success', data: customers });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, address, isMember } = req.body;

    const newCustomer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        isMember: isMember || false, // <--- key.value nya
      },
    });

    res.status(201).json({ status: 'success', data: newCustomer });
  } catch (error: any) {
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'Email/Phone';
      return res.status(400).json({
        status: 'fail',
        message: `${field} sudah terdaftar, gunakan yang lain.`,
      });
    }

    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = updateCustomerSchema.parse(req.body);

    const customer = await customerService.updateCustomerService(id, validatedData);

    res.status(200).json({
      status: 'success',
      message: 'Data member berhasil diupdate',
      data: customer,
    });
  } catch (error: any) {
    if (error.message === 'Customer not found') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};
