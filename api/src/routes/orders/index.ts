import { Router } from 'express';
import { createOrder } from './ordersController';
import { insertOrderWithItemsSchema } from '../../db/ordersSchema';
import { validateData } from '../../middlewares/validationMiddleware';
import { verifyToken } from '../../middlewares/authMiddleware';

const router = Router();

router.post('/', verifyToken, validateData(insertOrderWithItemsSchema), createOrder);

export default router;
