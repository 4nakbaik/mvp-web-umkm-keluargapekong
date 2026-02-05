import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as productService from '../services/product.service'; 
import { createProductSchema, updateProductSchema } from '../validations/product.validation'; 

// 1. GET ALL
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await productService.getAllProductsService();
    res.status(200).json({ status: 'success', data: products });
  } catch (error) {
    next(error);
  }
};

// 2. GET BY ID
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductByIdService(id);
    res.status(200).json({ status: 'success', data: product });
  } catch (error) {
    next(error); // Error  dr service lari kemari
  }
};

// 3. CREATE
export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    const userId = req.user?.id; // Aman krna pakai AuthReq
    const product = await productService.createProductService(validatedData, userId);

    res.status(201).json({ status: 'success', data: product });
  } catch (error) {
    next(error); // Error Zod/DB lari kemari
  }
};

// 4. UPDATE
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = updateProductSchema.parse(req.body); 
    const product = await productService.updateProductService(id, validatedData);

    res.status(200).json({ status: 'success', data: product });
  } catch (error: any) {
    if (error.message === 'Product not found') {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    next(error); 
  }
};

// 5. DELETE
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await productService.deleteProductService(id);
    
    res.status(200).json({ status: 'success', message: 'Product deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Product not found') {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    next(error); 
  }
};
