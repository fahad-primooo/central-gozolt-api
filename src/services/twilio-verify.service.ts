import twilio from 'twilio';
import logger from '../utils/logger.js';

interface TwilioVerifyConfig {
  accountSid: string;
  authToken: string;
  verifyServiceSid: string;
}

interface SendOTPResult {
  success: boolean;
  message: string;
  sid?: string;
}

interface VerifyOTPResult {
  success: boolean;
  message: string;
}

export class TwilioVerifyService {
  private client: twilio.Twilio;
  private verifyServiceSid: string;

  constructor(config: TwilioVerifyConfig) {
    this.client = twilio(config.accountSid, config.authToken);
    this.verifyServiceSid = config.verifyServiceSid;
  }

  /**
   * Send OTP via Twilio Verify (supports WhatsApp and SMS)
   * @param phoneNumber - Full phone number with country code (e.g., +923001234567)
   * @param channel - 'whatsapp' or 'sms'
   */
  async sendOTP(
    phoneNumber: string,
    channel: 'whatsapp' | 'sms' = 'whatsapp'
  ): Promise<SendOTPResult> {
    try {
      logger.info(`Sending OTP via ${channel} to ${phoneNumber}`);

      const verification = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verifications.create({
          to: phoneNumber,
          channel: channel,
        });

      if (verification.status === 'pending') {
        logger.info(
          `OTP sent successfully via ${channel} to ${phoneNumber}, SID: ${verification.sid}`
        );
        return {
          success: true,
          message: `OTP sent successfully via ${channel}`,
          sid: verification.sid,
        };
      }

      logger.warn(`Failed to send OTP via ${channel} to ${phoneNumber}: ${verification.status}`);
      return {
        success: false,
        message: `Failed to send OTP: ${verification.status}`,
      };
    } catch (error: any) {
      logger.error(`Twilio Verify error (${channel}): ${error.message}`);
      return {
        success: false,
        message: error.message || `Failed to send OTP via ${channel}`,
      };
    }
  }

  /**
   * Verify OTP code via Twilio Verify
   * @param phoneNumber - Full phone number with country code
   * @param code - The OTP code to verify
   */
  async verifyOTP(phoneNumber: string, code: string): Promise<VerifyOTPResult> {
    try {
      logger.info(`Verifying OTP for ${phoneNumber}`);

      const verificationCheck = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks.create({
          to: phoneNumber,
          code: code,
        });

      if (verificationCheck.status === 'approved') {
        logger.info(`OTP verified successfully for ${phoneNumber}`);
        return {
          success: true,
          message: 'OTP verified successfully',
        };
      }

      logger.warn(`OTP verification failed for ${phoneNumber}: ${verificationCheck.status}`);
      return {
        success: false,
        message: 'Invalid or expired OTP',
      };
    } catch (error: any) {
      logger.error(`Twilio Verify OTP verification error: ${error.message}`);
      return {
        success: false,
        message: error.message || 'OTP verification failed',
      };
    }
  }
}

// Export singleton instance
const twilioVerifyService = new TwilioVerifyService({
  accountSid: process.env.TWILIO_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID || '',
});

export default twilioVerifyService;
