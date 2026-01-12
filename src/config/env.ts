import dotenv from 'dotenv';

dotenv.config();
// Validate required environment variables
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required in environment variables');
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required in environment variables');
}

export const env = {
  port: process.env.PORT || '3000',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '90d',
  nodeEnv: process.env.NODE_ENV || 'development',

  // Redis / BullMQ
  redisUrl: process.env.REDIS_URL,
  redisHost: process.env.REDIS_HOST || '127.0.0.1',
  redisPort: process.env.REDIS_PORT || '6379',
  redisPassword: process.env.REDIS_PASSWORD,
  messageQueueName: process.env.MESSAGE_QUEUE_NAME || 'central-messages-queue',

  // Twilio
  twilioSid: process.env.TWILIO_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioVerifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID,
};
