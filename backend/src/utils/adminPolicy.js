import {ACTIVE_THEME_IDS} from '../config/templateRegistry.generated.js';
import {z} from 'zod';
export const reasonSchema=z.string().trim().min(8,'Alasan minimal 8 karakter.').max(500);
export const userAdminSchema=z.object({reason:reasonSchema,role:z.enum(['USER','ADMIN']).optional(),suspended:z.boolean().optional()}).strict().refine(v=>v.role!==undefined||v.suspended!==undefined,'Pilih tindakan.');
export const invitationAdminSchema=z.object({reason:reasonSchema,suspended:z.boolean().optional(),extendDays:z.number().int().min(1).max(365).optional(),unpublish:z.literal(true).optional()}).strict().refine(v=>v.suspended!==undefined||v.extendDays||v.unpublish,'Pilih tindakan.');
export function assertAdminRemains(user,next,activeAdmins){if(user.role==='ADMIN'&&!user.suspendedAt&&(next.role==='USER'||next.suspendedAt)&&activeAdmins<=1)throw Object.assign(new Error('Admin aktif terakhir tidak boleh dinonaktifkan atau diturunkan perannya.'),{status:409});}
export const ADMIN_THEMES=ACTIVE_THEME_IDS;
