import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    first_name: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
    last_name: z.string().min(1, 'Last name is required').max(100, 'Last name is too long'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must not exceed 50 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().email('Invalid email address'),
    country_code: z.string().regex(/^\+\d{1,4}$/, 'Invalid country code (e.g., +1, +92, +44)'),
    phone_number: z
      .string()
      .min(5, 'Phone number must be at least 5 digits')
      .max(15, 'Phone number must not exceed 15 digits')
      .regex(/^\d+$/, 'Phone number must contain only digits'),
    avatar: z.string().url('Invalid avatar URL').optional(),
    bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
  }),
});

export const initiateLoginSchema = z.object({
  body: z.object({
    country_code: z.string().regex(/^\+\d{1,4}$/, 'Invalid country code (e.g., +1, +92, +44)'),
    phone_number: z
      .string()
      .min(5, 'Phone number must be at least 5 digits')
      .max(15, 'Phone number must not exceed 15 digits')
      .regex(/^\d+$/, 'Phone number must contain only digits'),
    channel: z.enum(['whatsapp', 'sms']).optional().default('whatsapp'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    country_code: z.string().regex(/^\+\d{1,4}$/, 'Invalid country code (e.g., +1, +92, +44)'),
    phone_number: z
      .string()
      .min(5, 'Phone number must be at least 5 digits')
      .max(15, 'Phone number must not exceed 15 digits')
      .regex(/^\d+$/, 'Phone number must contain only digits'),
    otp: z
      .string()
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d{6}$/, 'OTP must contain only digits'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type InitiateLoginInput = z.infer<typeof initiateLoginSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
