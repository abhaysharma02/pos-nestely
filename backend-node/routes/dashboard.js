import express from 'express';
import prisma from '../prismaClient.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/summary', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart);
        weekStart.setDate(todayStart.getDate() - 7);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Revenue Aggregations
        const revTodayAggr = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { tenantId, createdAt: { gte: todayStart } }
        });
        const revenueToday = revTodayAggr._sum.totalAmount || 0;

        const revWeekAggr = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { tenantId, createdAt: { gte: weekStart } }
        });
        const revenueThisWeek = revWeekAggr._sum.totalAmount || 0;

        const revMonthAggr = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { tenantId, createdAt: { gte: monthStart } }
        });
        const revenueThisMonth = revMonthAggr._sum.totalAmount || 0;

        // Total Orders Today
        const totalOrdersToday = await prisma.order.count({
            where: { tenantId, createdAt: { gte: todayStart } }
        });

        // Active Orders
        const activeOrders = await prisma.order.count({
            where: {
                tenantId,
                status: { in: ["INITIATED", "PREPARING", "READY"] }
            }
        });

        // Top Selling Items
        // Prisma doesn't have a direct groupBy with limit yet, so we'll do raw or findMany and generic JS sort.
        // It's SQLite, so raw query works, but using JS might be safer if the DB size is small.
        const orderItems = await prisma.orderItem.groupBy({
            by: ['itemId'],
            _sum: { quantity: true },
            where: { order: { tenantId } },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });

        const topSellingItems = [];
        for (const itemRank of orderItems) {
            const item = await prisma.item.findUnique({ where: { id: itemRank.itemId } });
            topSellingItems.push({
                id: Number(item.id),
                name: item.name,
                totalSold: itemRank._sum.quantity
            });
        }

        res.status(200).json({
            success: true,
            message: "Dashboard metrics loaded",
            data: {
                revenueToday,
                revenueThisWeek,
                revenueThisMonth,
                totalOrdersToday,
                activeOrders,
                topSellingItems
            }
        });
    } catch (error) {
        console.error("Dashboard Summary Error:", error);
        res.status(500).json({ message: "Failed to load dashboard metrics", error: error.message });
    }
});

export default router;
