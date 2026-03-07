import { Queue } from 'bullmq';

const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
};

export const orderQueue = new Queue('order-queue', {
  connection: redisOptions,
});