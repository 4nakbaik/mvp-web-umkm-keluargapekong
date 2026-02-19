import { Router } from 'express'; 
import { createOrder, getOrders, getOrderReceipt,updateOrderStatus} from '../controllers/orderController'; 
import { protect, adminOnly, staffOnly } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect); 

router.post('/', staffOnly, createOrder); 
router.get('/', adminOnly, getOrders);    
router.get('/:id/receipt', staffOnly, getOrderReceipt); 
router.patch('/:id/status', adminOnly, updateOrderStatus);

export default router;
