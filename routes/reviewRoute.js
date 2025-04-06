import express from 'express';
import { getReviews, getReview, createReview, updateReview, deleteReview, } from '../controllers/reviewController.js';
import { adminOnly, authUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getReviews);
router.get('/:id', getReview);
router.post('/', authUser, createReview);
router.put('/:id', authUser, updateReview);
router.delete('/:id', authUser, adminOnly, deleteReview);

export default router;
