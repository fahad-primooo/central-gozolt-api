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
};
