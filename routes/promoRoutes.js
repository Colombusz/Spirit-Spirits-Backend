import express from 'express';
import upload from '../utils/multer.js';

import { createPromo, getAllPromos, deletePromo } from '../controllers/promoController.js';


const router = express.Router();

router.post('/', upload.array("images", 5), createPromo);
router.get('/', getAllPromos);
router.delete('/:id', deletePromo);

export default router;
