import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { createOrder, getOrders } from '../controllers/orderController';

const router = Router();

router.use(protect); 

router.post('/', createOrder); 
router.get('/', getOrders);    

export default router;