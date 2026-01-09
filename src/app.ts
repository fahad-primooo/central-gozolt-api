import express from 'express';
import { errorHandler } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/logger.middleware';
import userRoutes from './modules/user/user.routes';
import phoneVerificationRoutes from './modules/phone-verification/phone-verification.routes.js';
import authRoutes from './modules/auth/auth.routes';

const app = express();

app.use(express.json());

// Request logging
app.use(requestLogger);

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Routes matching Laravel structure
app.use('/api/verification', phoneVerificationRoutes);
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);

// Global error handler (always last)
app.use(errorHandler);

export default app;
