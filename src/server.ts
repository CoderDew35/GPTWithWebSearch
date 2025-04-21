import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const startServer = () => {
  const server = app.listen(env.PORT, () => {
    logger.info(`Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    logger.info(`API is available at http://localhost:${env.PORT}/api`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err: Error) => {
    logger.error('Unhandled Promise Rejection:', err);
    // Consider graceful shutdown in production
    if (env.NODE_ENV === 'production') {
      server.close(() => {
        process.exit(1);
      });
    }
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught Exception:', err);
    // Consider graceful shutdown in production
    if (env.NODE_ENV === 'production') {
      server.close(() => {
        process.exit(1);
      });
    }
  });

  // Handle OS termination signals
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
    });
  });
};

startServer();
