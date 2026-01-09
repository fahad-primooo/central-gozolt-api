import { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import phoneVerificationService from './phone-verification.service';
import logger from '../../utils/logger';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';

// Rate limiter for phone verification initiation
export const initiateVerificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    status: false,
    message: 'Too many verification requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const { contactNumber, countryCode } = req.body;
    return `${countryCode}${contactNumber}`.replace(/\s+/g, '');
  },
});

// Rate limiter for resend verification
export const resendVerificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: {
    status: false,
    message: 'Too many resend attempts. Please wait before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const { contactNumber, countryCode } = req.body;
    return `resend-${countryCode}${contactNumber}`.replace(/\s+/g, '');
  },
});

export class PhoneVerificationController {
  /**
   * Initiate phone verification for rider/driver registration
   * POST /api/phone-verification/initiate
   */
  initiateVerification = asyncHandler(async (req: Request, res: Response) => {
    const {
      contact_number: contactNumber,
      country_code: countryCode,
      verification_method: verificationMethod = 'whatsapp',
    } = req.body;

    // Check if user already exists with this phone number
    const userExists = await phoneVerificationService.checkUserExists(countryCode, contactNumber);

    if (userExists) {
      throw new ApiError(
        422,
        'An account with this phone number already exists. Please login instead.',
        {
          user_exists: true,
        }
      );
    }

    // Normalize phone number
    const normalizedPhone = (countryCode + contactNumber).replace(/\s+/g, '');

    // Delete any old verification records for this phone
    await phoneVerificationService.deleteOldVerifications(countryCode, contactNumber);

    // Add '+' prefix if not present
    const fullPhoneNumber = normalizedPhone.startsWith('+')
      ? normalizedPhone
      : `+${normalizedPhone}`;

    // Send OTP via Twilio Verify
    const channel = verificationMethod === 'sms' ? 'sms' : 'whatsapp';
    const result = await phoneVerificationService.sendOTP(fullPhoneNumber, channel);

    if (!result.success) {
      throw new ApiError(500, `Failed to send ${channel} OTP`, { error: result.message });
    }

    // Create phone verification record (tracking only, no OTP storage)
    await phoneVerificationService.createVerification(
      countryCode,
      contactNumber,
      channel,
      result.sid || null
    );

    logger.info(`${channel} verification initiated for phone: ${normalizedPhone}`);

    res.json({
      status: true,
      message: `OTP is being sent via ${channel}`,
      data: {
        normalized_phone: normalizedPhone,
        channel,
        expires_in_minutes: 10,
      },
    });
  });

  /**
   * Resend OTP (switch channel: WhatsApp ↔ SMS)
   * POST /api/phone-verification/resend
   */
  resendVerification = asyncHandler(async (req: Request, res: Response) => {
    const {
      contact_number: contactNumber,
      country_code: countryCode,
      verification_method: verificationMethod,
    } = req.body;
    const normalizedPhone = (countryCode + contactNumber).replace(/\s+/g, '');

    const verification = await phoneVerificationService.getPendingVerification(
      countryCode,
      contactNumber
    );

    if (!verification) {
      throw new ApiError(404, 'No pending verification found. Please start registration again.');
    }

    if (verification.attempts >= 5) {
      throw new ApiError(429, 'Maximum resend attempts reached. Please start registration again.');
    }

    // Add '+' prefix if not present
    const fullPhoneNumber = normalizedPhone.startsWith('+')
      ? normalizedPhone
      : `+${normalizedPhone}`;

    // Increment attempts
    await phoneVerificationService.incrementAttempts(verification.id);

    // Send OTP via Twilio Verify (any channel)
    const channel = verificationMethod === 'sms' ? 'sms' : 'whatsapp';
    const result = await phoneVerificationService.sendOTP(fullPhoneNumber, channel);

    if (!result.success) {
      throw new ApiError(500, `Failed to resend ${channel} OTP`, { error: result.message });
    }

    // Update verification record
    await phoneVerificationService.updateVerificationForResend(
      verification.id,
      channel,
      result.sid || null
    );

    logger.info(`${channel} OTP resent for phone: ${normalizedPhone}`);

    res.json({
      status: true,
      message: `OTP resent via ${channel}`,
      data: {
        channel,
        contact_number: contactNumber,
        country_code: countryCode,
      },
    });
  });

  /**
   * Verify OTP code via Twilio Verify (works for both WhatsApp and SMS)
   * POST /api/phone-verification/verify
   */
  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { contact_number: contactNumber, country_code: countryCode, otp } = req.body;
    const normalizedPhone = (countryCode + contactNumber).replace(/\s+/g, '');

    const verification = await phoneVerificationService.getPendingVerification(
      countryCode,
      contactNumber
    );

    if (!verification) {
      throw new ApiError(404, 'No pending verification found. Please start registration again.');
    }

    if (phoneVerificationService.isExpired(verification)) {
      throw new ApiError(400, 'Verification code has expired. Please request a new one.', {
        expired: true,
      });
    }

    // Add '+' prefix if not present
    const fullPhoneNumber = normalizedPhone.startsWith('+')
      ? normalizedPhone
      : `+${normalizedPhone}`;

    // Verify OTP via Twilio Verify
    const result = await phoneVerificationService.verifyOTP(fullPhoneNumber, otp);

    if (!result.success) {
      throw new ApiError(400, result.message || 'Invalid or expired OTP');
    }

    // Mark verification as verified
    await phoneVerificationService.markVerified(verification.id);

    logger.info(`Phone verified successfully via Twilio Verify: ${normalizedPhone}`);

    res.json({
      status: true,
      message: 'Phone number verified successfully',
      data: {
        contact_number: contactNumber,
        country_code: countryCode,
        verified_at: new Date(),
      },
    });
  });
}

export default new PhoneVerificationController();
