import { Router } from 'express'; 
import { createOrder, getOrders, getOrderReceipt } from '../controllers/orderController'; 
import { protect, adminOnly, staffOnly } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect); 

router.post('/', staffOnly, createOrder); 
router.get('/', adminOnly, getOrders);    
router.get('/:id/receipt', staffOnly, getOrderReceipt); 

export default router;