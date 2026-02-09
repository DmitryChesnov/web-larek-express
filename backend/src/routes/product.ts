import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
} from '../controllers/product';
import {
  validateProductCreate,
  validateProductId,
} from '../middlewares/validation';

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', validateProductId, getProductById);
router.post('/', validateProductCreate, createProduct);

export default router;
