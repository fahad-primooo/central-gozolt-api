import { z } from 'zod';

export const processActionSchema = z.object({
  body: z.object({
    actionType: z.string().min(1, 'Action type is required'),
    accountableType: z.string().min(1, 'Accountable type is required (e.g., User, Driver)'),
    accountableId: z.number().int().positive('Accountable ID must be a positive integer'),
    serviceType: z.string().optional(),
    sourceType: z.string().optional(),
    sourceId: z.number().int().positive().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
});

export const redeemRewardsSchema = z.object({
  body: z.object({
    accountableType: z.string().min(1, 'Accountable type is required (e.g., User, Driver)'),
    accountableId: z.number().int().positive('Accountable ID must be a positive integer'),
    serviceType: z.string().min(1, 'Service type is required (e.g., taxi, delivery)'),
    serviceName: z.string().optional(),
    sourceType: z.string().optional(),
    sourceId: z.number().int().positive().optional(),
    rideAmount: z.number().positive('Ride amount must be positive'),
    coinsToRedeem: z.number().int().positive('Coins to redeem must be a positive integer'),
  }),
});

export const getBalanceSchema = z.object({
  params: z.object({
    accountableType: z.string().min(1, 'Accountable type is required'),
    accountableId: z.string().regex(/^\d+$/, 'Accountable ID must be a number'),
  }),
});

export const getTransactionsSchema = z.object({
  params: z.object({
    accountableType: z.string().min(1, 'Accountable type is required'),
    accountableId: z.string().regex(/^\d+$/, 'Accountable ID must be a number'),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const createRuleSchema = z.object({
  body: z.object({
    actionType: z.string().min(1, 'Action type is required'),
    serviceType: z.string().optional(),
    pointsAwarded: z.number().int().positive('Points awarded must be a positive integer'),
    description: z.string().optional(),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateRuleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid rule ID'),
  }),
  body: z.object({
    actionType: z.string().min(1).optional(),
    serviceType: z.string().optional().nullable(),
    pointsAwarded: z.number().int().positive().optional(),
    description: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const deleteRuleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid rule ID'),
  }),
});

export type ProcessActionInput = z.infer<typeof processActionSchema>['body'];
export type RedeemRewardsInput = z.infer<typeof redeemRewardsSchema>['body'];
export type CreateRuleInput = z.infer<typeof createRuleSchema>['body'];
export type UpdateRuleInput = z.infer<typeof updateRuleSchema>['body'];
