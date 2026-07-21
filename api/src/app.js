import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import env from './config/env.js';
import v1Routes from './routes/v1/index.js';
import { globalLimiter, errorHandler, notFoundHandler } from './middleware/index.js';
import { success } from './utils/helpers/response.js';

const app = express();

// ─── Security ───────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.isDev
    ? true                        // allow everything in dev
    : [env.frontendUrl],          // whitelist in production
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Parsing & compression ─────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(compression());

// ─── Logging ────────────────────────────────────────
app.use(morgan(env.isDev ? 'dev' : 'combined'));

// ─── Rate limiting ──────────────────────────────────
app.use(globalLimiter);

// ─── Static files (uploads) ────────────────────────
app.use('/uploads', express.static('uploads'));

// ─── Health check ───────────────────────────────────
app.get('/health', (_req, res) => {
  return success(res, {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  }, 'Server is running');
});

// ─── API routes ─────────────────────────────────────
app.use('/api/v1', v1Routes);

// ─── 404 & error handling ──────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
