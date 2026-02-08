import express from 'express';
import * as orderController from '../controllers/orderController'; 
import { protect, adminOnly, staffOnly } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/', staffOnly, orderController.createOrder);
router.get('/',adminOnly, orderController.getOrders);

export default router;