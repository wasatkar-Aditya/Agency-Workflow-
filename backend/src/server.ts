import http from 'http';
import { createApp } from './app';
import { config } from './config/config';
import { connectDatabase } from './config/database';
import { initSocketIO } from './websocket/socket';
import { startOverdueScheduler } from './jobs/overdue.job';
import { logger } from './config/logger';

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);

  initSocketIO(server);
  startOverdueScheduler();

  server.listen(config.port, () => {
    logger.info(`AgencyFlow backend running on http://localhost:${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`Frontend URL: ${config.cors.frontendUrl}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      const { disconnectDatabase } = await import('./config/database');
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason });
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
