import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardController';
import { protect, adminOnly } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect, adminOnly);
router.get('/summary', getDashboardSummary);

export default router;