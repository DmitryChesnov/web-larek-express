import { Router } from 'express';
import productRoutes from './product';
import orderRoutes from './order';

const router = Router();

router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

export default router;
