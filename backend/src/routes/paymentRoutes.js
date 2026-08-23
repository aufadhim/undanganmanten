import { Router } from 'express';
import { createCheckout, midtransWebhook, getOrders } from '../controllers/paymentController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Endpoint untuk frontend melakukan checkout
router.post('/checkout', authenticate, createCheckout);

// Endpoint mendapatkan riwayat order
router.get('/orders', authenticate, getOrders);

// Endpoint webhook/notification dari Midtrans
router.post('/webhook', midtransWebhook);

export default router;
