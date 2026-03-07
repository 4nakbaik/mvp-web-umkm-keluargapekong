import { Router } from 'express';
import { exportStockMutationsExcel } from '../controllers/reportController';
import { protect, adminOnly } from '../middlewares/authMiddleware';

const router = Router();

router.get('/mutations/excel', protect, adminOnly, exportStockMutationsExcel);

export default router;