import { Worker } from 'bullmq';
import logger from '../utils/logger.js';
import twilioVerifyService from '../services/twilio-verify.service.js';
import { env } from '../config/env';

const connection = env.redisUrl
  ? { connection: { url: env.redisUrl } }
  : {
      connection: {
        host: env.redisHost,
        port: parseInt(env.redisPort || '6379', 10),
        password: env.redisPassword || undefined,
      },
    };

const QUEUE_NAME = env.messageQueueName;

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    logger.info(`Processing job ${job.name} id=${job.id}`);

    if (job.name === 'send-otp') {
      const { phoneNumber, channel } = job.data as {
        phoneNumber: string;
        channel: 'whatsapp' | 'sms';
      };
      const result = await twilioVerifyService.sendOTP(phoneNumber, channel);
      if (!result.success) {
        throw new Error(`send-otp failed: ${result.message}`);
      }
      return result;
    }

    logger.warn(`Unknown job name: ${job.name}`);
    return null;
  },
  connection as any
);

worker.on('completed', (job) => {
  logger.info(`Job ${job.id} (${job.name}) completed`);
});

worker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} (${job?.name}) failed: ${err?.message}`);
});

process.once('SIGINT', async () => {
  await worker.close();
  process.exit(0);
});

export default worker;
