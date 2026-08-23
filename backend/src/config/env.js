import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

function requireInProduction(name) {
  const value = process.env[name];
  if (isProduction && !value) {
    throw new Error(`Environment variable ${name} wajib diisi pada production.`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  isTest: process.env.NODE_ENV === 'test',
  port: Number(process.env.PORT || 4000),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:4000',
  midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  midtransServerKey: process.env.MIDTRANS_SERVER_KEY,
  midtransClientKey: process.env.MIDTRANS_CLIENT_KEY,
};

requireInProduction('DATABASE_URL');
requireInProduction('JWT_SECRET');
requireInProduction('FRONTEND_URL');
requireInProduction('BACKEND_URL');

if (isProduction) {
  requireInProduction('RESEND_API_KEY');
  requireInProduction('EMAIL_FROM');
  requireInProduction('MIDTRANS_SERVER_KEY');
  requireInProduction('MIDTRANS_CLIENT_KEY');
  requireInProduction('R2_ACCOUNT_ID');
  requireInProduction('R2_ACCESS_KEY_ID');
  requireInProduction('R2_SECRET_ACCESS_KEY');
  requireInProduction('R2_BUCKET_NAME');
  requireInProduction('R2_PUBLIC_URL');

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET production minimal 32 karakter.');
  }

  for (const [name, value] of [['FRONTEND_URL', env.frontendUrl], ['BACKEND_URL', env.backendUrl]]) {
    const url = new URL(value);
    if (url.protocol !== 'https:') throw new Error(`${name} production wajib menggunakan HTTPS.`);
  }
}
