import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import logger from '../../utils/logger';
import { createToken } from '../../utils/token';
import twilioVerifyService from '../../services/twilio-verify.service';

interface RegisterInput {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  country_code: string;
  phone_number: string;
  password: string;
  avatar?: string;
  bio?: string;
}

export class AuthService {
  /**
   * Register a new user
   * - Verifies phone verification exists and is verified
   * - Creates user account
   * - Deletes phone verification record after successful registration
   */
  async register(data: RegisterInput) {
    // 1. Check if phone number is verified
    const phoneVerification = await prisma.phoneVerification.findFirst({
      where: {
        countryCode: data.country_code,
        phoneNumber: data.phone_number,
        verified: true,
      },
    });

    if (!phoneVerification) {
      throw new ApiError(
        400,
        'Phone number not verified. Please complete OTP verification first.',
        { phone_verified: false }
      );
    }

    // 2. Check if phone verification has expired (optional safety check)
    if (new Date() > phoneVerification.expiresAt) {
      // Clean up expired verification
      await prisma.phoneVerification.delete({
        where: { id: phoneVerification.id },
      });
      throw new ApiError(400, 'Phone verification has expired. Please verify your phone again.', {
        phone_verified: false,
        expired: true,
      });
    }

    // 3. Check if user already exists with email, username, or phone
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username },
          {
            AND: [{ countryCode: data.country_code }, { phoneNumber: data.phone_number }],
          },
        ],
      },
    });

    if (existingUser) {
      let message = 'An account already exists';
      if (existingUser.email === data.email) {
        message = 'An account with this email already exists';
      } else if (existingUser.username === data.username) {
        message = 'This username is already taken';
      } else if (
        existingUser.countryCode === data.country_code &&
        existingUser.phoneNumber === data.phone_number
      ) {
        message = 'An account with this phone number already exists';
      }
      throw new ApiError(409, message);
    }

    // for now no password system kept for future in case needed
    // const hashedPassword = 'no-password-set';
    // const hashedPassword = await bcrypt.hash(data.password, 10);

    const displayName = `${data.first_name} ${data.last_name}`;

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          firstName: data.first_name,
          lastName: data.last_name,
          displayName,
          username: data.username,
          email: data.email,
          countryCode: data.country_code,
          phoneNumber: data.phone_number,
          // password: hashedPassword,
          avatar: data.avatar,
          bio: data.bio,
          phoneVerified: true,
          phoneVerifiedAt: phoneVerification.verifiedAt || new Date(),
        },
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
          phoneVerifiedAt: true,
          avatar: true,
          bio: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await tx.phoneVerification.delete({
        where: { id: phoneVerification.id },
      });

      await tx.rewardAccount.create({
        data: {
          userId: newUser.id,
          pointsBalance: 0,
        },
      });

      return newUser;
    });

    // Generate token for the registered user
    const { plainTextToken } = await createToken(user.id, 'auth_token', 7);

    logger.info(`New user registered successfully: ${user.username} (ID: ${user.id})`);

    return {
      user,
      token: plainTextToken,
    };
  }

  /**
   * Initiate login by sending OTP
   * - Checks if user exists with the phone number
   * - Sends OTP via Twilio Verify
   * - Creates/updates phone verification record for login tracking
   */
  async initiateLogin(
    country_code: string,
    phone_number: string,
    channel: 'whatsapp' | 'sms' = 'whatsapp'
  ) {
    // 1. Check if user exists with this phone number
    const user = await prisma.user.findFirst({
      where: {
        countryCode: country_code,
        phoneNumber: phone_number,
      },
    });

    if (!user) {
      throw new ApiError(404, 'No account found with this phone number. Please register first.');
    }

    // 2. Normalize phone number
    const normalizedPhone = (country_code + phone_number).replace(/\s+/g, '');
    const fullPhoneNumber = normalizedPhone.startsWith('+')
      ? normalizedPhone
      : `+${normalizedPhone}`;

    // 3. Delete any old login verification records for this phone
    await prisma.phoneVerification.deleteMany({
      where: {
        countryCode: country_code,
        phoneNumber: phone_number,
      },
    });

    // 4. Send OTP via Twilio Verify
    const result = await twilioVerifyService.enqueueSendOTP(fullPhoneNumber, channel);

    if (!result.success) {
      throw new ApiError(500, `Failed to send ${channel} OTP`, { error: result.message });
    }

    // 5. Create phone verification record for login tracking
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await prisma.phoneVerification.create({
      data: {
        countryCode: country_code,
        phoneNumber: phone_number,
        channel,
        verifySid: result.sid || null,
        expiresAt,
        attempts: 0,
      },
    });

    logger.info(`Login OTP sent to ${normalizedPhone} via ${channel}`);

    return {
      success: true,
      message: `OTP sent via ${channel}`,
      channel,
      expires_in_minutes: 10,
    };
  }

  /**
   * Login with OTP verification
   * - Verifies OTP via Twilio
   * - Returns user data and JWT token
   * - Deletes verification record after successful login
   */
  async login(country_code: string, phone_number: string, otp: string) {
    // 1. Check if user exists
    const user = await prisma.user.findFirst({
      where: {
        countryCode: country_code,
        phoneNumber: phone_number,
      },
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
        phoneVerifiedAt: true,
        avatar: true,
        bio: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'No account found with this phone number');
    }

    // 2. Check if login verification exists
    const verification = await prisma.phoneVerification.findFirst({
      where: {
        countryCode: country_code,
        phoneNumber: phone_number,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!verification) {
      throw new ApiError(400, 'No pending login verification found. Please request a new OTP.');
    }

    // 3. Check if verification has expired
    if (new Date() > verification.expiresAt) {
      await prisma.phoneVerification.delete({
        where: { id: verification.id },
      });
      throw new ApiError(400, 'OTP has expired. Please request a new one.', { expired: true });
    }

    // 4. Verify OTP via Twilio
    const normalizedPhone = (country_code + phone_number).replace(/\s+/g, '');
    const fullPhoneNumber = normalizedPhone.startsWith('+')
      ? normalizedPhone
      : `+${normalizedPhone}`;

    const otpResult = await twilioVerifyService.verifyOTP(fullPhoneNumber, otp);

    if (!otpResult.success) {
      throw new ApiError(400, otpResult.message || 'Invalid or expired OTP');
    }

    // 5. Generate plain text token
    const { plainTextToken } = await createToken(user.id, 'auth_token', 7);

    // 6. Update last login and delete verification record in transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      await tx.phoneVerification.delete({
        where: { id: verification.id },
      });
    });

    logger.info(`User logged in successfully: ${user.username} (ID: ${user.id})`);

    return {
      user,
      token: plainTextToken,
    };
  }
}

export default new AuthService();
