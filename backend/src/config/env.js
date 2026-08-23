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

if (isProduction && env.midtransIsProduction) {
  requireInProduction('MIDTRANS_SERVER_KEY');
  requireInProduction('MIDTRANS_CLIENT_KEY');
}
