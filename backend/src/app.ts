import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import clientRoutes from './routes/client.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import miscRoutes from './routes/misc.routes';

export function createApp() {
  const app = express();

  // ─── Security Headers ─────────────────────────────────
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // ─── CORS ─────────────────────────────────────────────
  app.use(cors({
    origin: config.cors.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // ─── Rate Limiting ────────────────────────────────────
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
  });

  const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 10,
    message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many auth attempts' } },
  });

  app.use(globalLimiter);

  // ─── Parsers ──────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // ─── Logging ──────────────────────────────────────────
  if (config.nodeEnv !== 'test') {
    app.use(morgan(config.isProd ? 'combined' : 'dev'));
  }

  // ─── Health check ─────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
  });

  // ─── Routes ───────────────────────────────────────────
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api', miscRoutes);

  // ─── Error handlers ───────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
