import { Router } from 'express';
import { checkout } from '../controllers/checkout.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.post('/', checkout);

export default router;
