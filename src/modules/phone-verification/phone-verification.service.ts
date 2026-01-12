import { prisma } from '../../lib/prisma';
import twilioVerifyService from '../../services/twilio-verify.service';
import logger from '../../utils/logger';

export class PhoneVerificationService {
  /**
   * Check if user already exists with the given phone number
   */
  async checkUserExists(countryCode: string, phoneNumber: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        countryCode,
        phoneNumber,
      },
    });
    return !!user;
  }

  /**
   * Create a phone verification record
   */
  async createVerification(
    countryCode: string,
    phoneNumber: string,
    channel: 'whatsapp' | 'sms',
    verifySid: string | null
  ) {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    return await prisma.phoneVerification.create({
      data: {
        countryCode,
        phoneNumber,
        channel,
        verifySid,
        expiresAt,
        attempts: 0,
      },
    });
  }

  /**
   * Delete old verification records for a phone number
   */
  async deleteOldVerifications(countryCode: string, phoneNumber: string) {
    await prisma.phoneVerification.deleteMany({
      where: {
        countryCode,
        phoneNumber,
      },
    });
  }

  /**
   * Get pending verification by normalized phone
   */
  async getPendingVerification(countryCode: string, phoneNumber: string) {
    return await prisma.phoneVerification.findFirst({
      where: {
        countryCode,
        phoneNumber,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Check if verification is expired
   */
  isExpired(verification: { expiresAt: Date }): boolean {
    return new Date() > verification.expiresAt;
  }

  /**
   * Increment verification attempts
   */
  async incrementAttempts(id: number) {
    return await prisma.phoneVerification.update({
      where: { id },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Update verification record for resend
   */
  async updateVerificationForResend(
    id: number,
    channel: 'whatsapp' | 'sms',
    verifySid: string | null
  ) {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    return await prisma.phoneVerification.update({
      where: { id },
      data: {
        channel,
        verifySid,
        expiresAt,
        otp: null,
      },
    });
  }

  /**
   * Mark verification as verified
   */
  async markVerified(id: number) {
    return await prisma.phoneVerification.update({
      where: { id },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    });
  }

  /**
   * Send OTP via Twilio Verify (enqueued via BullMQ worker)
   */
  async sendOTP(phoneNumber: string, channel: 'whatsapp' | 'sms') {
    return await twilioVerifyService.enqueueSendOTP(phoneNumber, channel);
  }

  /**
   * Verify OTP via Twilio Verify
   */
  async verifyOTP(phoneNumber: string, otp: string) {
    return await twilioVerifyService.verifyOTP(phoneNumber, otp);
  }
}

export default new PhoneVerificationService();
