import express from 'express';
import { errorHandler } from './middlewares/error.middleware';
import userRoutes from './modules/user/user.routes';

const app = express();

app.use(express.json());

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/users', userRoutes);

// Global error handler (always last)
app.use(errorHandler);

export default app;
