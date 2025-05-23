import express from 'express';
import {
  signup,
  login,
  googlelogin
} from '../controllers/loginController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/googlelogin', googlelogin);

export default router;