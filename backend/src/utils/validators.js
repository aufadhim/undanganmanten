import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP harus 6 digit'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token wajib diisi'),
  newPassword: z.string().min(8, 'Password minimal 8 karakter'),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Password lama wajib diisi'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
});

export const createInvitationSchema = z.object({
  groomName: z.string().min(1, 'Nama mempelai pria wajib diisi'),
  brideName: z.string().min(1, 'Nama mempelai wanita wajib diisi'),
  weddingDate: z.coerce.date({ errorMap: () => ({ message: 'Tanggal pernikahan tidak valid' }) }),
  themeId: z.string().optional(),
  customSlug: z.string().min(3, 'Slug minimal 3 karakter').optional(),
});

export const updateInvitationSchema = z.object({
  slug: z.string().min(3, 'Slug minimal 3 karakter').optional(),
  weddingDate: z.coerce.date().optional(),
  themeId: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

const colorCategorySchema = z
  .object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    tertiary: z.string().optional(),
    enabled: z.boolean().optional(),
  })
  .partial();

export const updateThemeSettingsSchema = z.object({
  background: colorCategorySchema.optional(),
  bodyText: colorCategorySchema.optional(),
  button: colorCategorySchema.optional(),
  typography: z
    .object({
      fontHeading: z.string().optional(),
      fontBody: z.string().optional(),
    })
    .partial()
    .optional(),
  musicUrl: z.string().optional().or(z.literal('')),
  animationType: z.string().optional(),
  customLogoUrl: z.string().optional().or(z.literal('')),
  waTemplate: z.string().optional(),
  dresscodeText: z.string().optional(),
  dresscodeDetails: z.any().optional(), // Can be an object or array of objects
  igFilterUrl: z.string().optional(),
  igFilterImageUrl: z.string().optional().or(z.literal('')),
  coverType: z.string().optional(),
  coverImageUrl: z.string().optional().or(z.literal('')),
  coverSecondImageUrl: z.string().optional().or(z.literal('')),
  openingAnimation: z.string().optional(),
  layoutOrder: z.any().optional(), // Array of section order objects
  mainStory: z.string().optional(),
});

export const applyPresetSchema = z.object({
  presetId: z.string().min(1, 'presetId wajib diisi'),
});

export const updateCoupleProfileSchema = z.object({
  groomName: z.string().trim().min(1).max(100).optional(),
  groomFullName: z.string().trim().max(150).optional(),
  groomFather: z.string().trim().max(150).optional(),
  groomMother: z.string().trim().max(150).optional(),
  groomIg: z.string().trim().max(100).optional(),
  groomBio: z.string().trim().max(2000).optional(),
  brideName: z.string().trim().min(1).max(100).optional(),
  brideFullName: z.string().trim().max(150).optional(),
  brideFather: z.string().trim().max(150).optional(),
  brideMother: z.string().trim().max(150).optional(),
  brideIg: z.string().trim().max(100).optional(),
  brideBio: z.string().trim().max(2000).optional(),
});

export const upsertEventSchema = z.object({
  type: z.enum(['akad', 'resepsi']),
  date: z.union([z.string().length(0).transform(() => null), z.coerce.date()]).optional().nullable(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  venueName: z.string().optional(),
  address: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  lat: z.union([z.string().length(0).transform(() => null), z.coerce.number()]).optional().nullable(),
  lng: z.union([z.string().length(0).transform(() => null), z.coerce.number()]).optional().nullable(),
  mapStyleId: z.string().optional(),
});

export const reorderGallerySchema = z.object({
  items: z.array(z.object({ id: z.string(), order: z.number() })),
});

export const timelineStorySchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  description: z.string().optional(),
  date: z.coerce.date().optional(),
  photoUrl: z.string().optional(),
  order: z.number().optional(),
});

export const guestSchema = z.object({
  name: z.string().min(1, 'Nama tamu wajib diisi'),
  phone: z.string().optional(),
  groupName: z.string().optional(),
});

export const bulkGuestSchema = z.object({
  guests: z.array(guestSchema).min(1, 'Minimal 1 tamu'),
});

export const rsvpSchema = z.object({
  attending: z.boolean(),
  guestCount: z.coerce.number().min(1).default(1),
  note: z.string().optional(),
});

export const wishSchema = z.object({
  senderName: z.string().min(1, 'Nama pengirim wajib diisi'),
  message: z.string().min(1, 'Pesan tidak boleh kosong').max(500),
});

export const giftSettingsSchema = z.object({
  type: z.enum(['bank_transfer', 'address', 'both']),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolder: z.string().optional(),
  shippingAddress: z.string().optional(),
});

// Mengizinkan string kosong "" pada URL jika user menghapus link
export const livestreamSettingsSchema = z.object({
  platform: z.string().optional(),
  url: z.string().url('URL tidak valid').optional().or(z.literal('')),
  coverImageUrl: z.string().optional().or(z.literal('')),
});

export const invitationFeaturesSchema = z.object({
  rsvpEnabled: z.boolean().optional(),
  giftEnabled: z.boolean().optional(),
  livestreamEnabled: z.boolean().optional(),
  timelineEnabled: z.boolean().optional(),
  storyEnabled: z.boolean().optional(),
  musicEnabled: z.boolean().optional(),
  animationEnabled: z.boolean().optional(),
  customLogoEnabled: z.boolean().optional(),
  dresscodeEnabled: z.boolean().optional(),
  rundownEnabled: z.boolean().optional(),
  igFilterEnabled: z.boolean().optional(),
});
