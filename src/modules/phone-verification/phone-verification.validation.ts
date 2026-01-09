import { z } from 'zod';

export const initiatePhoneVerificationSchema = z.object({
  body: z.object({
    contact_number: z
      .string()
      .min(5, 'Phone number must be at least 5 digits')
      .max(15, 'Phone number must not exceed 15 digits')
      .regex(/^\d+$/, 'Phone number must contain only digits'),
    country_code: z.string().regex(/^\+\d{1,4}$/, 'Invalid country code (e.g., +1, +92, +44)'),
    verification_method: z.enum(['whatsapp', 'sms']).optional().default('whatsapp'),
  }),
});

export const resendPhoneVerificationSchema = z.object({
  body: z.object({
    contact_number: z
      .string()
      .min(5, 'Phone number must be at least 5 digits')
      .max(15, 'Phone number must not exceed 15 digits')
      .regex(/^\d+$/, 'Phone number must contain only digits'),
    country_code: z.string().regex(/^\+\d{1,4}$/, 'Invalid country code (e.g., +1, +92, +44)'),
    verification_method: z.enum(['whatsapp', 'sms']),
  }),
});

export const verifyPhoneOtpSchema = z.object({
  body: z.object({
    contact_number: z
      .string()
      .min(5, 'Phone number must be at least 5 digits')
      .max(15, 'Phone number must not exceed 15 digits')
      .regex(/^\d+$/, 'Phone number must contain only digits'),
    country_code: z.string().regex(/^\+\d{1,4}$/, 'Invalid country code (e.g., +1, +92, +44)'),
    otp: z
      .string()
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d{6}$/, 'OTP must contain only digits'),
  }),
});

export type InitiatePhoneVerificationInput = z.infer<
  typeof initiatePhoneVerificationSchema
>['body'];
export type ResendPhoneVerificationInput = z.infer<typeof resendPhoneVerificationSchema>['body'];
export type VerifyPhoneOtpInput = z.infer<typeof verifyPhoneOtpSchema>['body'];
