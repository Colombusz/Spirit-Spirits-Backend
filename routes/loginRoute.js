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


// Patanggal na lang nito pag ayaw mo haha:
// POST     /api/auth/signup        — Create a new user
// POST     /api/auth/login         — Login an existing user
// POST     /api/auth/googlelogin   — Login with a Google ID token