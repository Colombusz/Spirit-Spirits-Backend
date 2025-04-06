import express from 'express';
import upload from '../utils/multer.js';
import {
  getLiquors,
  getLiquor,
  createLiquor,
  updateLiquor,
  deleteLiquor
} from '../controllers/liquorController.js';
import { adminOnly, authUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getLiquors);
router.post('/', upload.array("images", 5), createLiquor);
router.get('/:id', getLiquor);
router.put('/:id', authUser, adminOnly, upload.array("images", 5), updateLiquor);
router.delete('/:id', authUser, adminOnly, deleteLiquor);

export default router;
