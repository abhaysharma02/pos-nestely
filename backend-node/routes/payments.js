import express from 'express';
import crypto from 'crypto';
import prisma from '../prismaClient.js';

const router = express.Router();

const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET || 'MOCK_SECRET_FOR_DEV';

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        if (!signature) {
            return res.status(400).send("Signature missing");
        }

        const payloadString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_SECRET)
            .update(payloadString)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.error("Invalid Webhook Signature!");
            return res.status(400).send("Invalid signature");
        }

        // Make sure it's parsed for JSON
        const json = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const event = json.event;

        if (event === 'payment.captured' || event === 'payment.failed') {
            const paymentEntity = json.payload.payment.entity;
            const rzpOrderId = paymentEntity.order_id;
            const rzpPaymentId = paymentEntity.id;

            const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: rzpOrderId } });

            if (!payment) {
                console.warn("Webhook ignored: Payment record not found for", rzpOrderId);
                return res.status(200).send("OK");
            }

            if (event === 'payment.captured') {
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: 'SUCCESS', razorpayPaymentId: rzpPaymentId, updatedAt: new Date() }
                });

                await prisma.order.update({
                    where: { id: payment.orderId },
                    data: { status: 'CONFIRMED' }
                });

                console.log(`Order ${payment.orderId} confirmed via webhook`);
            } else if (event === 'payment.failed') {
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: 'FAILED', updatedAt: new Date() }
                });

                await prisma.order.update({
                    where: { id: payment.orderId },
                    data: { status: 'FAILED' }
                });
                console.log(`Order ${payment.orderId} failed via webhook`);
            }
        }

        res.status(200).send("OK");
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).send("Webhook processing error");
    }
});

export default router;
