import express from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { protect, adminOnly } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/', dashboardController.getDashboardStats);

export default router;