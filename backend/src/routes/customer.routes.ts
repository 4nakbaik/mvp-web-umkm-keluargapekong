import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { createCustomer, getCustomers , updateCustomer} from '../controllers/customerController';

const router = Router();

router.get('/', protect, getCustomers);
router.post('/', protect, createCustomer);
router.put('/:id', protect, updateCustomer); 

export default router;