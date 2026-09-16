import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function required(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

export const config = {
  port: parseInt(process.env['PORT'] ?? '5000', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  isProd: process.env['NODE_ENV'] === 'production',

  db: {
    url: required('DATABASE_URL'),
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env['ACCESS_TOKEN_EXPIRES_IN'] ?? '15m',
    refreshExpiresIn: process.env['REFRESH_TOKEN_EXPIRES_IN'] ?? '7d',
  },

  cors: {
    frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:5173',
  },

  cookie: {
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: (process.env['NODE_ENV'] === 'production' ? 'strict' : 'lax') as 'strict' | 'lax' | 'none',
  },
} as const;
