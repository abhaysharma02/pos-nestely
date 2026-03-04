import express from 'express';
import prisma from '../prismaClient.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/current', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        // Fetch the most recently created ACTIVE or active-most subscription
        const subscription = await prisma.subscription.findFirst({
            where: { tenantId: tenantId, status: 'ACTIVE' },
            orderBy: { startDate: 'desc' }
        });

        if (!subscription) {
            return res.status(404).json({ message: "No active subscription found" });
        }

        res.status(200).json({
            success: true,
            message: "Subscription details retrieved",
            data: {
                id: Number(subscription.id),
                planType: subscription.planType,
                status: subscription.status,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                tenantId: Number(subscription.tenantId)
            }
        });
    } catch (error) {
        console.error("Get Subscription Error:", error);
        res.status(500).json({ message: "Failed to fetch subscription", error: error.message });
    }
});

export default router;
