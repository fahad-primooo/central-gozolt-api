import { Router } from 'express';
import authController, { initiateLoginLimiter } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { registerSchema, initiateLoginSchema, loginSchema } from './auth.validation';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /api/register
 * @desc    Register a new user account (requires verified phone number)
 * @access  Public
 */
// changed: use explicit /register so mounting at /api yields /api/register
router.post('/register', validate(registerSchema), authController.register);

/**
 * @route   GET /api/me
 * @desc    Get authenticated user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.me);

/**
 * @route   POST /api/logout
 * @desc    Logout user (revoke current token)
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/phone-login/request-otp
 * @desc    Request OTP for phone login
 * @access  Public
 */
// changed: use full path so mounting at /api yields /api/phone-login/request-otp
router.post(
  '/phone-login/request-otp',
  initiateLoginLimiter,
  validate(initiateLoginSchema),
  authController.initiateLogin
);

/**
 * @route   POST /api/phone-login/verify-otp
 * @desc    Verify OTP and login
 * @access  Public
 */
// changed: use full path so mounting at /api yields /api/phone-login/verify-otp
router.post('/phone-login/verify-otp', validate(loginSchema), authController.login);

export default router;
