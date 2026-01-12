import { Queue, JobsOptions } from 'bullmq';
import logger from '../utils/logger.js';
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

// Queue instance
const queue = new Queue(QUEUE_NAME, connection as any);

// Note: QueueScheduler instantiation removed to avoid TypeScript import issues
// If you want to enable scheduling/retry coordination, instantiate QueueScheduler
// via a runtime import or after adding correct types for your BullMQ version.

export async function enqueue(name: string, data: any, opts?: JobsOptions) {
  logger.info(`Enqueuing job ${name}`);
  return queue.add(name, data, opts || {});
}

export default {
  queue,
  enqueue,
  QUEUE_NAME,
};
