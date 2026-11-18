import {themeAssetUpload} from '../middlewares/upload.js';
import {compressImage} from '../middlewares/compressImage.js';
import { Router } from 'express';
import {
  getAdminStats, getAdminUserDetail,getAdminTemplates,updateAdminTemplate,getAdminAudit,getAdminOperations,
  getAdminOrders,
  manualActivateOrder,
  getAdminInvitations,
  updateAdminInvitation,
  grantInvitationAccess,
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
router.patch('/invitations/:invitationId/access', grantInvitationAccess);
router.get('/users', getAdminUsers);
router.get('/users/:userId',getAdminUserDetail);
router.patch('/users/:userId',updateUserRole);
router.get('/templates',getAdminTemplates);
router.patch('/templates/:id',updateAdminTemplate);
router.get('/audit',getAdminAudit);
router.get('/operations',getAdminOperations);
router.patch('/users/:userId/role', updateUserRole);

export default router;
