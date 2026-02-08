import { Request, Response, NextFunction } from 'express';
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
    
    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }

    res.status(200).json({ status: 'success', data: product });
  } catch (error) {
    next(error);
  }
};

// 3. CREATE
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, price, stock, category } = req.body;

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const payload = {
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      imageUrl
    };

    const validatedData = createProductSchema.parse(payload);
    const product = await productService.createProductService(validatedData);

    res.status(201).json({ status: 'success', data: product });

  } catch (error) {
    next(error);
  }
};

// 4. UPDATE
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, price, stock, category } = req.body;
    const payload: any = {
      name,
      category,
    };

    if (price) payload.price = Number(price);
    if (stock) payload.stock = Number(stock);
    if (req.file) {
      payload.imageUrl = `/uploads/${req.file.filename}`;
    }

    const validatedData = updateProductSchema.parse(payload);
    const product = await productService.updateProductService(id, validatedData);

    res.status(200).json({ status: 'success', data: product });
  } catch (error: any) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ status: 'fail', message: 'Product not found' });
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
      return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }
    next(error); 
  }
};