import { Router } from 'express';
import { getCustomerByPhone } from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/:phone', getCustomerByPhone);

export default router;
