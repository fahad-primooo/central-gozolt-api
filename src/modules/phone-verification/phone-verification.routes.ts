import { Router } from 'express';
import phoneVerificationController, {
  initiateVerificationLimiter,
  resendVerificationLimiter,
} from './phone-verification.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  initiatePhoneVerificationSchema,
  resendPhoneVerificationSchema,
  verifyPhoneOtpSchema,
} from './phone-verification.validation.js';

const router = Router();

/**
 * @route   POST /api/phone-verification/initiate
 * @desc    Initiate phone verification (send OTP via WhatsApp or SMS)
 * @access  Public
 */
router.post(
  '/initiate',
  initiateVerificationLimiter,
  validate(initiatePhoneVerificationSchema),
  phoneVerificationController.initiateVerification
);

/**
 * @route   POST /api/phone-verification/resend
 * @desc    Resend OTP (switch between WhatsApp and SMS)
 * @access  Public
 */
router.post(
  '/resend',
  resendVerificationLimiter,
  validate(resendPhoneVerificationSchema),
  phoneVerificationController.resendVerification
);

/**
 * @route   POST /api/phone-verification/verify
 * @desc    Verify OTP code
 * @access  Public
 */
router.post('/verify', validate(verifyPhoneOtpSchema), phoneVerificationController.verifyOtp);

export default router;
