import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { ApiError } from './ApiError';
import { env } from '../config/env';

interface JWTPayload {
  userId: number;
  jti: string; // JWT ID for tracking and revocation
  tokenName: string;
}

/**
 * Generate a unique token identifier (JTI - JWT ID)
 * @returns Unique identifier
 */
function generateJti(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Create a new JWT token for a user
 * @param userId User ID
 * @param tokenName Token name (default: 'auth_token')
 * @param expiresInDays Expiration in days (uses env default if null)
 * @returns Object containing JWT token and token record
 */
export async function createToken(
  userId: number,
  tokenName = 'auth_token',
  expiresInDays: number | null = null
) {
  const jti = generateJti();

  const expiresIn: StringValue | number = (
    expiresInDays ? `${expiresInDays}d` : env.jwtAccessTokenExpiration
  ) as StringValue;

  const envExpirationMatch = env.jwtAccessTokenExpiration.match(/^(\d+)d$/);
  const envExpirationDays = envExpirationMatch ? parseInt(envExpirationMatch[1]) : 90;
  const expirationDays = expiresInDays || envExpirationDays;
  const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);

  // Create JWT payload
  const payload: JWTPayload = {
    userId,
    jti,
    tokenName,
  };

  // Sign the JWT token
  const signOptions: SignOptions = { expiresIn };
  const plainTextToken = jwt.sign(payload, env.jwtSecret, signOptions);

  const tokenRecord = await prisma.token.create({
    data: {
      userId,
      name: tokenName,
      token: jti, // Store JTI for revocation tracking
      expiresAt,
    },
  });

  return {
    plainTextToken,
    tokenRecord,
  };
}

/**
 * Verify a JWT token and return the associated user
 * @param token JWT token from Authorization header
 * @returns User object if token is valid
 * @throws ApiError if token is invalid or expired
 */
export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JWTPayload;

    const tokenRecord = await prisma.token.findUnique({
      where: { token: decoded.jti },
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
      throw new ApiError(401, 'Token has been revoked');
    }

    // Update last used timestamp (async, don't wait for it)
    prisma.token
      .update({
        where: { id: tokenRecord.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => {});

    return tokenRecord.user;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, 'Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, 'Token has expired');
    }
    // Re-throw ApiError instances
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, 'Token verification failed');
  }
}

/**
 * Revoke (delete) a specific token
 * @param token JWT token to revoke
 */
export async function revokeToken(token: string) {
  try {
    // Decode the token to get the JTI (don't verify, just decode)
    const decoded = jwt.decode(token) as JWTPayload | null;

    if (!decoded || !decoded.jti) {
      throw new ApiError(400, 'Invalid token format');
    }

    // Delete the token record using JTI
    await prisma.token.delete({
      where: { token: decoded.jti },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
  }
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
