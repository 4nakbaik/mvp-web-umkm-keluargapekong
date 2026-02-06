import { Router } from 'express';
import { protect, adminOnly } from '../middlewares/authMiddleware'; 
import {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';


const router = Router();

// Cust/Staff 
router.get('/', protect, getProducts);
router.get('/:id', protect, getProductById);

// Admin 
router.post('/',protect, adminOnly, createProduct);
router.put('/:id',protect, adminOnly, updateProduct);
router.delete('/:id',protect, adminOnly, deleteProduct);

export default router;