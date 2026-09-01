export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
).replace(/\/$/, '');

export const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || API_BASE_URL.replace(/\/api$/, '')
).replace(/\/$/, '');

export const R2_PUBLIC_URL = (
  import.meta.env.VITE_R2_PUBLIC_URL || ''
).replace(/\/$/, '');

export function resolveImageUrl(value) {
  if (!value || value.startsWith('http://') || value.startsWith('https://')) return value || '';
  const path = value.startsWith('/') ? value : `/${value}`;
  // Bundled frontend assets live on the same origin as the app, not on the API server.
  if (path.startsWith('/assets/')) return path;
  if (R2_PUBLIC_URL && path.startsWith('/invitations')) return `${R2_PUBLIC_URL}${path}`;
  return `${BACKEND_URL}${path}`;
}
