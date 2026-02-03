import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';

const router = Router();

router.get('/', protect, getProducts);
router.get('/:id', protect, getProductById);

// Admin
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

export default router;
