import { Router } from 'express';
import {
    listThemePresets,
    applyThemePreset,
    updateMyThemeSettings,
    uploadAsset,
    getCharacterRenderAssets,
} from '../controllers/themeController.js';
import {editableInvitation} from '../middlewares/editableInvitation.js';
import { authenticate } from '../middlewares/auth.js';
import { themeAssetUpload } from '../middlewares/upload.js';
import { compressImage } from '../middlewares/compressImage.js';

const router = Router();

// Endpoint Publik (tanpa login)
router.get('/', listThemePresets);
router.get('/presets', listThemePresets);


// Endpoint Butuh Login (Akses Data User)
router.get('/character-assets',authenticate,editableInvitation,getCharacterRenderAssets);
router.post('/apply-preset', authenticate, editableInvitation, applyThemePreset);
router.patch('/me', authenticate, editableInvitation, updateMyThemeSettings);
router.post('/upload-asset', authenticate, editableInvitation, themeAssetUpload.single('file'), compressImage, uploadAsset);

export default router;
