import express from 'express';
import upload from '../utils/multer.js';
import {
  verifyEmail,
  logout,
  updateProfile,
  getUsers,
  getUserById,
  getCurrentUser,
  storeFCM,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

const router = express.Router();

router.post('/verify-email', verifyEmail);
router.get('/logout', logout);
router.put('/update-profile', upload.single("image"), updateProfile);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.get('/current-user', getCurrentUser);
router.post('/store-fcm', storeFCM);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;


// Patanggal na lang nito pag ayaw mo haha:
// POST     /api/auth/verify-email          — Verify email address using a code
// GET      /api/auth/logout                — Logout the current user
// PUT      /api/auth/update-profile        — Update user profile (optionally with an image)
// GET      /api/auth/users                 — Retrieve all users (admin functionality, for example)
// GET      /api/auth/users/:id             — Get a user by ID
// GET      /api/auth/current-user          — Get the currently logged-in user (requires auth middleware)
// POST     /api/auth/store-fcm             — Store a Firebase Cloud Messaging token
// POST     /api/auth/forgot-password       — Initiate the forgot password process
// POST     /api/auth/reset-password/:token — Reset password using a token