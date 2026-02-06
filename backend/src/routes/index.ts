import { Router } from 'express';
import productRoutes from './product';
import orderRoutes from './order';

const router = Router();

router.use('/product', productRoutes);
router.use('/order', orderRoutes);

export default router;
