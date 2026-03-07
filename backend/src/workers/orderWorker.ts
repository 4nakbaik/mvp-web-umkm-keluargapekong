import { Worker, Job } from 'bullmq';
import prisma from '../utils/prisma';

const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
};

export const orderWorker = new Worker('order-queue', async (job: Job) => {
  const { orderId } = job.data;

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) return;

    if (order.status === 'PENDING') {
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      });

      for (const item of order.items) {
        const currentProduct = await tx.product.findUnique({ where: { id: item.productId } });
        const newStock = (currentProduct?.stock || 0) + item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: newStock }
        });

        await tx.stockMutation.create({
          data: {
            productId: item.productId,
            userId: order.userId,
            type: 'IN',
            quantity: item.quantity,
            remainingStock: newStock,
            description: `Auto-cancel TRX-${order.code}`
          }
        });
      }
      console.log(`[Worker] Order ${order.code} cancelled due to timeout.`);
    }
  });
}, { connection: redisOptions });

orderWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});