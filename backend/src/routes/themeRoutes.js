import { Router } from 'express';
import {
    listThemePresets,
    applyThemePreset,
    updateMyThemeSettings,
    uploadAsset,
} from '../controllers/themeController.js';
import { authenticate } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { compressImage } from '../middlewares/compressImage.js';

const router = Router();

// Endpoint Publik (tanpa login)
router.get('/', listThemePresets);
router.get('/presets', listThemePresets);

// Endpoint Butuh Login (Akses Data User)
router.post('/apply-preset', authenticate, applyThemePreset);
router.patch('/me', authenticate, updateMyThemeSettings);
router.post('/upload-asset', authenticate, upload.single('file'), compressImage, uploadAsset);

export default router;