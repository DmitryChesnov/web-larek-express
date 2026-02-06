import { Router } from 'express';
import { createOrder } from '../controllers/order';
import { validateOrderCreate } from '../middlewares/validation';

const router = Router();

router.post('/', validateOrderCreate, createOrder);

export default router;