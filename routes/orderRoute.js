import express from 'express';
import { getOrders, updateOrder, createOrder } from '../controllers/orderController.js';
import upload from '../utils/multer.js';
import { authUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authUser, getOrders);
router.post('/', authUser, upload.single('proofOfPayment'), createOrder);
router.put('/:id', authUser, updateOrder);

export default router;