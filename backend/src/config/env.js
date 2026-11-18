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
  tripay: {
    apiKey: process.env.TRIPAY_API_KEY,
    privateKey: process.env.TRIPAY_PRIVATE_KEY,
    merchantCode: process.env.TRIPAY_MERCHANT_CODE,
    method: process.env.TRIPAY_METHOD,
    mode: process.env.TRIPAY_MODE,
    sandboxAccounts: (process.env.TRIPAY_SANDBOX_ACCOUNTS || '').split(',').map(email => email.trim().toLowerCase()).filter(Boolean),
  },
  accountEmailEnabled: !isProduction || Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
};

requireInProduction('DATABASE_URL');
requireInProduction('JWT_SECRET');
requireInProduction('FRONTEND_URL');
requireInProduction('BACKEND_URL');

if (isProduction) {
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
