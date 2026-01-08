import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50)
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().email('Invalid email address'),
    countryCode: z.string().regex(/^\+\d{1,4}$/, 'Invalid country code (e.g., +1, +92, +44)'),
    phoneNumber: z
      .string()
      .min(5, 'Phone number must be at least 5 digits')
      .max(15, 'Phone number must not exceed 15 digits')
      .regex(/^\d+$/, 'Phone number must contain only digits'),
    avatar: z.string().url('Invalid avatar URL').optional(),
    bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    username: z
      .string()
      .min(3)
      .max(50)
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
      .optional(),
    email: z.string().email('Invalid email address').optional(),
    avatar: z.string().url('Invalid avatar URL').optional(),
    bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid user ID'),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid user ID'),
  }),
});

export const getUserByEmailSchema = z.object({
  params: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const getUserByUsernameSchema = z.object({
  params: z.object({
    username: z.string().min(3).max(50),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid user ID'),
  }),
  query: z.object({
    soft: z.enum(['true', 'false']).optional(),
  }),
});

export const getAllUsersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
