import { Router } from 'express';
import { createCheckout, midtransWebhook, getOrders, tripayCallback, paymentAvailability, refreshTripayOrder } from '../controllers/paymentController.js';
import { authenticate } from '../middlewares/auth.js';
import rateLimit from 'express-rate-limit';

const router = Router();
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak percobaan checkout. Silakan coba lagi beberapa saat.' },
});

// Endpoint untuk frontend melakukan checkout
router.post('/checkout', authenticate, checkoutLimiter, createCheckout);

// Endpoint mendapatkan riwayat order
router.get('/availability', authenticate, paymentAvailability);
router.get('/orders', authenticate, getOrders);
router.post('/orders/:orderId/refresh', authenticate, checkoutLimiter, refreshTripayOrder);

// Endpoint webhook/notification dari Midtrans
router.post('/webhook', midtransWebhook);
router.post('/tripay/callback', tripayCallback);

export default router;
