import express from 'express';
import { getOrders, updateOrder, createOrder } from '../controllers/orderController.js';
import upload from '../utils/multer.js';

const router = express.Router();

router.get('/', getOrders);
router.post('/', upload.single('proofOfPayment'), createOrder);
router.put('/:id', updateOrder);

export default router;