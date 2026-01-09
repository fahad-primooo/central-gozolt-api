import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Authentication middleware
 * Verifies Bearer token and attaches user to request object
 */
export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Unauthorized. No token provided.');
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    if (!token) {
      throw new ApiError(401, 'Unauthorized. Invalid token format.');
    }

    // Verify token and get user
    const user = await verifyToken(token);

    // Attach user to request object for use in controllers
    (req as any).user = user;

    next();
  }
);
