import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        user: { select: { email: true, role: true } }, // Join table User
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      status: 'success',
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const userId = (req.user as any).id; // Daoat dari Auth Middleware
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock: parseInt(stock),
        category,
        userId,
      },
    });

    res.status(201).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }

    res.status(200).json({ status: 'success', data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category } = req.body;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ status: 'fail', message: 'Product not found' });

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        stock: parseInt(stock),
        category,
      },
    });

    res.status(200).json({ status: 'success', data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } }); // Cek dulu apakah produknye ada
    if (!existing) return res.status(404).json({ status: 'fail', message: 'Product not found' });

    await prisma.product.delete({ where: { id } });

    res.status(200).json({ status: 'success', message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};
