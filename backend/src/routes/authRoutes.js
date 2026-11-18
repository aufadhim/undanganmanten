import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  signup,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  deleteAccount,
  me,
  updateAccount,
  testReset,
  resendOtp,
} from '../controllers/authController.js';
import { googleLogin } from '../controllers/googleAuthController.js';
import { authenticate } from '../middlewares/auth.js';
import { env } from '../config/env.js';

const router = Router();

// Rate limiting untuk endpoint sensitif
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // batasi setiap IP maksimal 10 request per windowMs
  message: { error: 'Terlalu banyak request, silakan coba lagi setelah 15 menit.' },
});

// Endpoint publik
router.post('/signup', authLimiter, signup);
router.post('/google', googleLogin);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-otp', authLimiter, resendOtp);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Endpoint privat (butuh token)
router.post('/change-password', authenticate, changePassword);
router.delete('/delete-account', authenticate, deleteAccount);
router.get('/me', authenticate, me);
router.patch('/me', authenticate, updateAccount);

// Endpoint utilitas hanya tersedia pada development/test.
if (env.isTest && process.env.ALLOW_TEST_RESET === 'true') {
  router.post('/test-reset', testReset);
}

export default router;
