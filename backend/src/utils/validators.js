import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().trim().email('Email tidak valid').max(254),
  password: z.string().min(8, 'Password minimal 8 karakter').max(128),
  phone: z.string().trim().max(30).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Email tidak valid').max(254),
  password: z.string().min(1, 'Password wajib diisi').max(128),
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
  weddingId: z.string().uuid().optional(),
  groomName: z.string().trim().min(1, 'Nama mempelai pria wajib diisi').max(100),
  brideName: z.string().trim().min(1, 'Nama mempelai wanita wajib diisi').max(100),
  weddingDate: z.coerce.date({ errorMap: () => ({ message: 'Tanggal pernikahan tidak valid' }) }),
  themeId: z.string().max(50).optional(),
  customSlug: z.string().trim().min(3, 'Slug minimal 3 karakter').max(60).regex(/^[a-z0-9-]+$/, 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung').optional(),
});

export const updateInvitationSchema = z.object({
  slug: z.string().trim().min(3, 'Slug minimal 3 karakter').max(60).regex(/^[a-z0-9-]+$/, 'Slug tidak valid').optional(),
  weddingDate: z.coerce.date().optional(),
  themeId: z.string().max(50).optional(),
  status: z.enum(['draft', 'published']).optional(),
  rsvpDeadline: z.union([z.literal('').transform(() => null), z.coerce.date()]).optional().nullable(),
  rsvpOpenToPublic: z.boolean().optional(),
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
  background: colorCategorySchema.extend({ envelopeDesign: z.enum(['classic', 'botanical', 'navy', 'calla', 'orchid']).optional(), envelopeColor: z.union([z.literal(""), z.string().regex(/^#[0-9a-f]{6}$/i)]).optional() }).optional(),
  bodyText: colorCategorySchema.optional(),
  button: colorCategorySchema.optional(),
  typography: z
    .object({
      sections: z.record(z.enum(['cover','hero','quote','bride','groom','profile','countdown','events','rundown','story','gallery','dresscode','livestream','igFilter','gift','rsvp','wishes','wishList','footer']), z.object({
        formWidth:z.number().min(.7).max(1).optional(),formGap:z.number().min(8).max(28).optional(),
        metricsMode:z.enum(['template','custom']).optional(),
        headingScale:z.number().min(.5).max(1.5).optional(),bodyScale:z.number().min(.75).max(1.5).optional(),
        headingLineHeight:z.number().min(.8).max(2).optional(),bodyLineHeight:z.number().min(1).max(2.5).optional(),
        headingLetterSpacing:z.number().min(-.08).max(.3).optional(),bodyLetterSpacing:z.number().min(-.04).max(.2).optional(),
      })).optional(),
      fontHeading: z.string().max(100).regex(/^[\w\s'",.-]+$/u, 'Font heading tidak valid').optional(),
      fontBody: z.string().max(100).regex(/^[\w\s'",.-]+$/u, 'Font body tidak valid').optional(),
      metricsMode:z.enum(['template','custom']).optional(),
      headingScale:z.number().min(0.5).max(1.5).optional(),
      bodyScale:z.number().min(0.75).max(1.5).optional(),
      headingLineHeight: z.number().min(0.8).max(2).optional(),
      bodyLineHeight: z.number().min(1).max(2.5).optional(),
      headingLetterSpacing: z.number().min(-0.08).max(0.3).optional(),
      bodyLetterSpacing: z.number().min(-0.04).max(0.2).optional(),
    })
    .partial()
    .optional(),
  musicUrl: z.string().max(2048).optional().or(z.literal('')),
  animationType: z.string().max(50).optional(),
  customLogoUrl: z.string().max(2048).optional().or(z.literal('')),
  waTemplate: z.string().max(2000).optional(),
  dresscodeText: z.string().max(1000).optional(),
  dresscodeDetails: z.any().optional(), // Can be an object or array of objects
  igFilterUrl: z.string().max(2048).optional(),
  igFilterImageUrl: z.string().max(2048).optional().or(z.literal('')),
  characterSettings: z.object({
    mode:z.enum(['default','custom']),separatePose:z.boolean(),
    cover:z.object({scale:z.number().min(.5).max(1.5),x:z.number().min(-200).max(200),y:z.number().min(-200).max(200),aspect:z.number().min(.15).max(4).optional(),anchors:z.object({bride:z.object({x:z.number().min(0).max(1),y:z.number().min(0).max(1)}),groom:z.object({x:z.number().min(0).max(1),y:z.number().min(0).max(1)})}).optional()}),
    hero:z.object({scale:z.number().min(.5).max(1.5),x:z.number().min(-200).max(200),y:z.number().min(-200).max(200),aspect:z.number().min(.15).max(4).optional(),anchors:z.object({bride:z.object({x:z.number().min(0).max(1),y:z.number().min(0).max(1)}),groom:z.object({x:z.number().min(0).max(1),y:z.number().min(0).max(1)})}).optional()}),
    closing:z.object({scale:z.number().min(.3).max(1.5),x:z.number().min(-300).max(300),y:z.number().min(-300).max(300)}).optional(),
  }).optional(),
  coverType: z.string().max(50).optional(),
  coverImageUrl: z.string().max(2048).optional().or(z.literal('')),
  coverSecondImageUrl: z.string().max(2048).optional().or(z.literal('')),
  openingAnimation: z.enum(['', 'fade', 'zoom', 'slide-down', 'camera-push']).optional(),
  brideInstagramEnabled: z.boolean().optional(),
  groomInstagramEnabled: z.boolean().optional(),
  brideBioEnabled: z.boolean().optional(),
  groomBioEnabled: z.boolean().optional(),
  galleryLayout: z.enum(['editorial', 'grid', 'masonry', 'carousel', 'collage', 'wall']).optional(),
  loadingAnimation: z.enum(['breathe', 'spin', 'reveal', 'shimmer']).optional(),
  closingText: z.string().max(1000).optional(),
  layoutOrder: z.array(z.object({ id: z.string().max(50), enabled: z.boolean() }).passthrough()).max(50).optional(),
  mainStory: z.string().max(5000).optional(),
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
  type: z.enum(['akad', 'resepsi', 'ngunduh_mantu']),
  date: z.union([z.string().length(0).transform(() => null), z.coerce.date()]).optional().nullable(),
  startTime: z.string().max(20).optional(),
  endTime: z.string().max(20).optional(),
  venueName: z.string().max(200).optional(),
  address: z.string().max(1000).optional(),
  googleMapsUrl: z.string().max(2048).optional(),
  lat: z.union([z.string().length(0).transform(() => null), z.coerce.number()]).optional().nullable(),
  lng: z.union([z.string().length(0).transform(() => null), z.coerce.number()]).optional().nullable(),
  mapStyleId: z.string().max(100).optional(),
});

export const reorderGallerySchema = z.object({
  items: z.array(z.object({ id: z.string().uuid(), order: z.number().int().min(0).max(10000) })).max(100),
});

export const timelineStorySchema = z.object({
  title: z.string().trim().min(1, 'Judul wajib diisi').max(150),
  description: z.string().max(2000).optional(),
  date: z.coerce.date().optional(),
  photoUrl: z.string().max(2048).optional(),
  order: z.number().optional(),
});

export const guestSchema = z.object({
  name: z.string().trim().min(1, 'Nama tamu wajib diisi').max(120),
  phone: z.string().trim().max(30).optional(),
  groupName: z.string().trim().max(100).optional(),
  paxLimit: z.coerce.number().int().min(1).max(2).default(2),
});

export const bulkGuestSchema = z.object({
  guests: z.array(guestSchema).min(1, 'Minimal 1 tamu').max(1000, 'Maksimal 1000 tamu per impor'),
});

export const rsvpSchema = z.object({
  attending: z.boolean(),
  guestCount: z.coerce.number().int().min(1).max(2, 'Jumlah tamu maksimal 2 orang').default(1),
  note: z.string().max(500).optional(),
});

export const wishSchema = z.object({
  senderName: z.string().trim().min(1, 'Nama pengirim wajib diisi').max(120),
  message: z.string().min(1, 'Pesan tidak boleh kosong').max(500),
});

export const giftSettingsSchema = z.object({
  type: z.enum(['bank_transfer', 'address', 'both']),
  bankName: z.string().max(100).optional(),
  accountNumber: z.string().max(100).optional(),
  accountHolder: z.string().max(150).optional(),
  shippingAddress: z.string().max(1000).optional(),
  bankAccounts: z.array(z.object({
    bankName: z.string().trim().min(1).max(100),
    accountNumber: z.string().trim().min(1).max(100),
    accountHolder: z.string().trim().min(1).max(150),
  })).max(10).optional(),
 }).superRefine((data,ctx)=>{
  if(data.type!=='bank_transfer'&&!data.shippingAddress?.trim())ctx.addIssue({code:z.ZodIssueCode.custom,path:['shippingAddress'],message:'Alamat pengiriman wajib diisi.'});
  if(data.type!=='address'){
    const accounts=data.bankAccounts?.length?data.bankAccounts:[{bankName:data.bankName,accountNumber:data.accountNumber,accountHolder:data.accountHolder}];
    if(!accounts.length||accounts.some(a=>!a.bankName?.trim()||!a.accountNumber?.trim()||!a.accountHolder?.trim()))ctx.addIssue({code:z.ZodIssueCode.custom,path:['bankAccounts'],message:'Lengkapi bank, nomor tujuan, dan nama pemilik rekening.'});
  }
});

// Mengizinkan string kosong "" pada URL jika user menghapus link
export const livestreamSettingsSchema = z.object({
  platform: z.string().optional(),
  url: z.string().url('URL tidak valid').optional().or(z.literal('')),
  coverImageUrl: z.string().optional().or(z.literal('')),
});

export const invitationFeaturesSchema = z.object({
  rsvpEnabled: z.boolean().optional(),
  wishesEnabled: z.boolean().optional(),
  wishesModerationEnabled: z.boolean().optional(),
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
