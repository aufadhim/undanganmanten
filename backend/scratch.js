import { z } from 'zod';

const upsertEventSchema = z.object({
  type: z.enum(['akad', 'resepsi']),
  date: z.union([z.string().length(0).transform(() => null), z.coerce.date()]).optional().nullable(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  venueName: z.string().optional(),
  address: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  mapStyleId: z.string().optional(),
});

const res = upsertEventSchema.safeParse({
  type: 'akad',
  date: '',
  startTime: '',
  endTime: '',
  venueName: '',
  address: '',
  googleMapsUrl: '',
  lat: '',
  lng: ''
});

console.log(JSON.stringify(res, null, 2));
