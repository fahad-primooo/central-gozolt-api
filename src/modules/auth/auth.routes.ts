import { Router } from 'express';
import authController, { initiateLoginLimiter } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { registerSchema, initiateLoginSchema, loginSchema } from './auth.validation';

const router = Router();

/**
 * @route   POST /api/register
 * @desc    Register a new user account (requires verified phone number)
 * @access  Public
 */
router.post('/', validate(registerSchema), authController.register);

/**
 * @route   POST /api/phone-login/request-otp
 * @desc    Request OTP for phone login
 * @access  Public
 */
router.post(
  '/request-otp',
  initiateLoginLimiter,
  validate(initiateLoginSchema),
  authController.initiateLogin
);

/**
 * @route   POST /api/phone-login/verify-otp
 * @desc    Verify OTP and login
 * @access  Public
 */
router.post('/verify-otp', validate(loginSchema), authController.login);

export default router;
