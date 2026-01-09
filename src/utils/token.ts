import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { ApiError } from './ApiError';

/**
 * Generate a random plain text token (similar to Laravel Sanctum)
 * @param length Token length (default: 40 characters)
 * @returns Plain text token
 */
export function generatePlainTextToken(length = 40): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

/**
 * Hash a token using SHA-256
 * @param token Plain text token
 * @returns Hashed token
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Create a new token for a user
 * @param userId User ID
 * @param tokenName Token name (default: 'auth_token')
 * @param expiresInDays Expiration in days (default: 7 days, null for no expiration)
 * @returns Object containing plain text token and token record
 */
export async function createToken(
  userId: number,
  tokenName = 'auth_token',
  expiresInDays: number | null = 7
) {
  // Generate plain text token
  const plainTextToken = generatePlainTextToken();

  // Hash the token for storage
  const hashedToken = hashToken(plainTextToken);

  // Calculate expiration date
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  // Create token record
  const tokenRecord = await prisma.token.create({
    data: {
      userId,
      name: tokenName,
      token: hashedToken,
      expiresAt,
    },
  });

  return {
    plainTextToken,
    tokenRecord,
  };
}

/**
 * Verify a token and return the associated user
 * @param token Plain text token from Authorization header
 * @returns User object if token is valid
 * @throws ApiError if token is invalid or expired
 */
export async function verifyToken(token: string) {
  // Hash the provided token
  const hashedToken = hashToken(token);

  // Find the token in database
  const tokenRecord = await prisma.token.findUnique({
    where: { token: hashedToken },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          displayName: true,
          username: true,
          email: true,
          countryCode: true,
          phoneNumber: true,
          emailVerified: true,
          phoneVerified: true,
          avatar: true,
          bio: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!tokenRecord) {
    throw new ApiError(401, 'Invalid token');
  }

  // Check if token has expired
  if (tokenRecord.expiresAt && new Date() > tokenRecord.expiresAt) {
    // Delete expired token
    await prisma.token.delete({
      where: { id: tokenRecord.id },
    });
    throw new ApiError(401, 'Token has expired');
  }

  // Update last used timestamp
  await prisma.token.update({
    where: { id: tokenRecord.id },
    data: { lastUsedAt: new Date() },
  });

  return tokenRecord.user;
}

/**
 * Revoke (delete) a specific token
 * @param token Plain text token or hashed token
 */
export async function revokeToken(token: string) {
  const hashedToken = hashToken(token);

  await prisma.token.delete({
    where: { token: hashedToken },
  });
}

/**
 * Revoke all tokens for a user
 * @param userId User ID
 */
export async function revokeAllUserTokens(userId: number) {
  await prisma.token.deleteMany({
    where: { userId },
  });
}
