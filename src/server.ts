import app from './app';
import { env } from './config/env';
import logger from './utils/logger';

const startServer = async () => {
  app.listen(env.port, () => {
    logger.info(`🚀 Server running on port ${env.port}`);
    logger.info(`Environment: ${env.nodeEnv}`);
    logger.info(`Database: ${env.databaseUrl ? 'Connected' : 'Not configured'}`);
  });
};

startServer();
