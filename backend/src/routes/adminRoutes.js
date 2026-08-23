import { Router } from 'express';
import {
  getAdminStats,
  getAdminOrders,
  manualActivateOrder,
  getAdminInvitations,
  updateAdminInvitation,
  getAdminUsers,
  updateUserRole,
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';

const router = Router();

// Semua rute admin wajib LULUS autentikasi + role ADMIN
router.use(authenticate);
router.use(requireAdmin);

router.get('/stats', getAdminStats);
router.get('/orders', getAdminOrders);
router.post('/orders/:orderId/activate', manualActivateOrder);
router.get('/invitations', getAdminInvitations);
router.patch('/invitations/:invitationId', updateAdminInvitation);
router.get('/users', getAdminUsers);
router.patch('/users/:userId/role', updateUserRole);

export default router;
