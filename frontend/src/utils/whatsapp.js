export function normalizeWhatsAppPhone(phone) {
  const value = String(phone ?? '').trim();
  const digits = value.replace(/\D/g, '');
  if (value.startsWith('+')) return digits;
  if (digits.startsWith('00')) return digits.slice(2);
  if (/^0?8/.test(digits)) return '62' + digits.replace(/^0/, '');
  return digits;
}
