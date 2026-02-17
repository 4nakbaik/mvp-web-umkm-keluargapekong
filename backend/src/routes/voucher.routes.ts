import { Router } from 'express';
import { 
  createVoucher, 
  getVouchers, 
  updateVoucher, 
  deleteVoucher 
} from '../controllers/voucherController';
import { protect, adminOnly, staffOnly } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', staffOnly, getVouchers);
router.post('/', adminOnly, createVoucher);
router.put('/:id', adminOnly, updateVoucher);
router.delete('/:id', adminOnly, deleteVoucher);

export default router;