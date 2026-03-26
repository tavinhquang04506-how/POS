import { Router } from 'express';
import { getProducts, getProductByBarcode } from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Require login for all product routes
router.use(authenticate);

router.get('/', getProducts);
router.get('/:id', getProductByBarcode);

export default router;
