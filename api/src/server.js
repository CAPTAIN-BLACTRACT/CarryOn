import app from './app.js';
import env from './config/env.js';
import logger from './utils/logger.js';

const PORT = env.port;

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 CarryOn API running`, {
    port: PORT,
    environment: env.nodeEnv,
    health: `http://localhost:${PORT}/health`,
    api: `http://localhost:${PORT}/api/v1`,
  });
});

// ─── Graceful shutdown ──────────────────────────────
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: reason?.message || reason });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception — shutting down', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down gracefully');
  process.exit(0);
});
