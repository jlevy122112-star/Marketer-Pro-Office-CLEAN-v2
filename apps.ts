import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { requestLogger } from './common/middleware/requestlogger';
import { errorHandler } from './common/middleware/errorhandler';

// Route imports
import authRoutes from './auth/auth.routes';
import usersRoutes from './users/users.routes';
import brandsRoutes from './brands/brands.routes';
import campaignsRoutes from './campaigns/campaigns.routes';
import { contentItemRouter } from './content-crud/content-crud.routes';
import calendarRoutes from './calendar/calendar.routes';
import analyticsRoutes from './analytics/analytics.routes';
import progressionRoutes from './progression/progression.routes';
import notificationsRoutes from './notifications/notifications.routes';
import creatorRoutes from './creator/creator.routes';
import ppcRoutes from './ppc/ppc.routes';
import metaRoutes from './integrations/meta/meta.routes';
import tiktokRoutes from './integrations/tiktok/tiktok.routes';
import linkedinRoutes from './integrations/linkedin/linkedin.routes';
import googleAdsRoutes from './integrations/googleads/googleads.routes';

const app = express();

// ── Security headers ────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,   // Allow Capacitor webview
  contentSecurityPolicy: false,       // Managed by Capacitor/client
}));

// ── CORS ────────────────────────────────────
const allowedOrigins = [
  env.FRONTEND_URL,
  'capacitor://localhost',
  'http://localhost',
  'http://localhost:3000',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Body parsing ────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request logging ─────────────────────────
app.use(requestLogger);

// ── Routes ──────────────────────────────────
app.use('/auth', authRoutes);
app.use('/', usersRoutes);                              // GET /me, PATCH /me, DELETE /me
app.use('/brands', brandsRoutes);
app.use('/campaigns', campaignsRoutes);
app.use('/content', contentItemRouter);                 // GET /content/:id etc.
app.use('/calendar', calendarRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/progression', progressionRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/creator', creatorRoutes);                     // GET /creator/profile, /creator/leaderboard
app.use('/ppc', ppcRoutes);                             // Full PPC campaign CRUD + metrics

// ── Social integrations ─────────────────────
app.use('/integrations/meta', metaRoutes);
app.use('/integrations/tiktok', tiktokRoutes);
app.use('/integrations/linkedin', linkedinRoutes);
app.use('/integrations/googleads', googleAdsRoutes);

// ── Health check ────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error handler — must be last ────────────
app.use(errorHandler);

export default app;
