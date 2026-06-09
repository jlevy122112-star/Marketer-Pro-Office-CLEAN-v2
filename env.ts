import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || '4000',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'change-me-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'refresh-change-me',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Frontend / CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Redis (BullMQ job queues — Railway Redis in production)
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',

  // Anthropic Claude AI
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',

  // Social platform OAuth
  META_APP_ID: process.env.META_APP_ID || '',
  META_APP_SECRET: process.env.META_APP_SECRET || '',
  TIKTOK_CLIENT_KEY: process.env.TIKTOK_CLIENT_KEY || '',
  TIKTOK_CLIENT_SECRET: process.env.TIKTOK_CLIENT_SECRET || '',
  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID || '',
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_ADS_DEVELOPER_TOKEN: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
};

// Validate critical vars at startup
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    console.warn(`⚠️  Missing required env var: ${key}`);
  }
}

// Warn about optional-but-important vars
const recommended = ['ANTHROPIC_API_KEY', 'REDIS_URL', 'STRIPE_SECRET_KEY'];
for (const key of recommended) {
  if (!process.env[key]) {
    console.warn(`ℹ️  Missing recommended env var: ${key} (some features will be disabled)`);
  }
}
