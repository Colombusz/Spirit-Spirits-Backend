import express from 'express';
import { getReviews, getReview, createReview, updateReview, deleteReview, } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/', getReviews);
router.get('/:id', getReview);
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

export default router;
