import { Request, Response, NextFunction } from 'express';
import * as customerService from '../services/customer.service';
import { createCustomerSchema, updateCustomerSchema } from '../validations/customer.validation';

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
    // 1. Validasi Input
    const validatedData = createCustomerSchema.parse(req.body);

    // 2. Panggil Service
    const customer = await customerService.createCustomerService(validatedData);

    res.status(201).json({
      status: 'success',
      message: 'Member berhasil didaftarkan',
      data: customer
    });
  } catch (error) {
    next(error); // Error dupe no HP bakal lari kemari
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
      data: customer
    });
  } catch (error: any) {
    if (error.message === 'Customer not found') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};