import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { createCustomer, getCustomers } from '../controllers/customerController';

const router = Router();

router.use(protect);

router.post('/', createCustomer); 
router.get('/', getCustomers);    

export default router;