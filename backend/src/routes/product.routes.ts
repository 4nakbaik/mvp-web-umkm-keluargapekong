import { Router } from 'express';
import { protect, adminOnly } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware'; // Middleware Multer
import {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';

const router = Router();

// --- CUST/STAFF ---
router.get('/', getProducts);
router.get('/:id', getProductById);

// --- ADMIN ---
router.post('/', protect, adminOnly, upload.single('image'), createProduct);
router.put('/:id', protect, adminOnly, upload.single('image'), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;