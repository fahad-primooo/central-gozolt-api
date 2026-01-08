import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import logger from '../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    logger.warn(`API Error: ${err.message} - ${req.method} ${req.originalUrl}`);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  logger.error(`Unexpected Error: ${err.message} - ${req.method} ${req.originalUrl}`);
  logger.error(err.stack || '');

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
