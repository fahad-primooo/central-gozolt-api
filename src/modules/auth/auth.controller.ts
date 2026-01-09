import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import authService from './auth.service';
import logger from '../../utils/logger';
import { rateLimit } from 'express-rate-limit';

// Rate limiter for login initiation
export const initiateLoginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    status: false,
    message: 'Too many login attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const { phone_number, country_code } = req.body;
    return `login-${country_code}${phone_number}`.replace(/\s+/g, '');
  },
});

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const {
      first_name,
      last_name,
      username,
      email,
      country_code,
      phone_number,
      password,
      avatar,
      bio,
    } = req.body;

    const { user, token } = await authService.register({
      first_name,
      last_name,
      username,
      email,
      country_code,
      phone_number,
      password,
      avatar,
      bio,
    });

    logger.info(`User registered: ${username}`);

    res.status(201).json({
      status: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          display_name: user.displayName,
          username: user.username,
          email: user.email,
          country_code: user.countryCode,
          phone_number: user.phoneNumber,
          email_verified: user.emailVerified,
          phone_verified: user.phoneVerified,
          phone_verified_at: user.phoneVerifiedAt,
          avatar: user.avatar,
          bio: user.bio,
          status: user.status,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        },
        auth_token: token,
      },
    });
  });

  /**
   * Initiate login by sending OTP
   * POST /api/auth/login/initiate
   */
  initiateLogin = asyncHandler(async (req: Request, res: Response) => {
    const { country_code, phone_number, channel = 'whatsapp' } = req.body;

    const result = await authService.initiateLogin(country_code, phone_number, channel);

    res.json({
      status: true,
      message: result.message,
      data: {
        channel: result.channel,
        expires_in_minutes: result.expires_in_minutes,
      },
    });
  });

  /**
   * Login with OTP verification
   * POST /api/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { country_code, phone_number, otp } = req.body;

    const { user, token } = await authService.login(country_code, phone_number, otp);

    logger.info(`User logged in: ${user.username}`);

    res.json({
      status: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          display_name: user.displayName,
          username: user.username,
          email: user.email,
          country_code: user.countryCode,
          phone_number: user.phoneNumber,
          email_verified: user.emailVerified,
          phone_verified: user.phoneVerified,
          phone_verified_at: user.phoneVerifiedAt,
          avatar: user.avatar,
          bio: user.bio,
          status: user.status,
          last_login_at: user.lastLoginAt,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        },
        auth_token: token,
      },
    });
  });

  /**
   * Get authenticated user
   * GET /api/me
   */
  me = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;

    res.json({
      status: true,
      data: {
        user: {
          id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          display_name: user.displayName,
          username: user.username,
          email: user.email,
          country_code: user.countryCode,
          phone_number: user.phoneNumber,
          email_verified: user.emailVerified,
          phone_verified: user.phoneVerified,
          phone_verified_at: user.phoneVerifiedAt,
          avatar: user.avatar,
          bio: user.bio,
          status: user.status,
          last_login_at: user.lastLoginAt,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        },
      },
    });
  });

  /**
   * Logout user (revoke token)
   * POST /api/logout
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      // Revoke the token
      const { revokeToken } = await import('../../utils/token');
      await revokeToken(token);

      logger.info('User logged out successfully');
    }

    res.json({
      status: true,
      message: 'Logged out successfully',
    });
  });
}

export default new AuthController();
