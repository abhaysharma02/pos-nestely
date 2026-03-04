import express from 'express';
import crypto from 'crypto';
import prisma from '../prismaClient.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

function generateToken() {
    return crypto.randomUUID().substring(0, 6).toUpperCase();
}

router.post('/', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const userId = req.user.userId;
        const { items, subtotal, taxAmount, discountAmount, totalAmount, paymentMethod, customerName, customerPhone } = req.body;

        const order = await prisma.order.create({
            data: {
                tenantId: tenantId,
                userId: userId,
                tokenNumber: generateToken(),
                subtotal: Number(subtotal),
                taxAmount: Number(taxAmount),
                discountAmount: Number(discountAmount),
                totalAmount: Number(totalAmount),
                paymentMethod: paymentMethod,
                customerName: customerName || null,
                customerPhone: customerPhone || null,
                status: 'INITIATED',
                orderItems: {
                    create: items.map(dto => ({
                        itemId: Number(dto.itemId),
                        quantity: Number(dto.quantity),
                        unitPrice: Number(dto.unitPrice),
                        totalPrice: Number(dto.totalPrice)
                    }))
                }
            },
            include: { orderItems: true }
        });

        const responsePayload = {
            orderId: Number(order.id),
            status: order.status
        };

        if (paymentMethod.toLowerCase() !== 'cash') {
            // Mock Razorpay Order Creation
            const razorpayOrderId = "order_mock_" + crypto.randomBytes(6).toString('hex');

            await prisma.payment.create({
                data: {
                    amount: Number(totalAmount),
                    currency: 'INR',
                    razorpayOrderId: razorpayOrderId,
                    status: 'CREATED',
                    orderId: order.id,
                    tenantId: tenantId
                }
            });

            responsePayload.razorpayOrderId = razorpayOrderId;
        } else {
            await prisma.order.update({
                where: { id: order.id },
                data: { status: 'CONFIRMED' }
            });
            responsePayload.status = 'CONFIRMED';
            // Websockets would normally broadcast here
        }

        res.status(200).json({
            success: true,
            message: "Order placed",
            data: responsePayload
        });
    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ message: "Failed to create order", error: error.message });
    }
});

router.get('/history', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const { page = 0, size = 10, status, startDate, endDate } = req.query;

        const whereClause = { tenantId: tenantId };

        if (status && status !== 'ALL') {
            whereClause.status = status;
        }

        if (startDate || endDate) {
            whereClause.createdAt = {};
            if (startDate) {
                whereClause.createdAt.gte = new Date(startDate + "T00:00:00");
            }
            if (endDate) {
                whereClause.createdAt.lte = new Date(endDate + "T23:59:59");
            }
        }

        const skip = Number(page) * Number(size);
        const take = Number(size);

        const [orders, totalElements] = await Promise.all([
            prisma.order.findMany({
                where: whereClause,
                skip: skip,
                take: take,
                orderBy: { createdAt: 'desc' },
                include: { orderItems: { include: { item: true } }, user: true }
            }),
            prisma.order.count({ where: whereClause })
        ]);

        const totalPages = Math.ceil(totalElements / take);

        // Serialize correctly
        const content = orders.map(o => ({
            ...o,
            id: Number(o.id),
            tenantId: Number(o.tenantId),
            userId: Number(o.userId),
            items: o.orderItems.map(oi => ({
                ...oi,
                id: Number(oi.id),
                itemId: Number(oi.itemId),
                orderId: Number(oi.orderId),
                itemName: oi.item ? oi.item.name : 'Unknown Item'
            })),
            orderItems: undefined // Remove from final payload
        }));

        res.status(200).json({
            success: true,
            message: "History fetched",
            data: {
                content: content,
                pageNumber: Number(page),
                pageSize: take,
                totalElements: totalElements,
                totalPages: totalPages,
                isLast: Number(page) >= totalPages - 1
            }
        });
    } catch (error) {
        console.error("Get Order History Error:", error);
        res.status(500).json({ message: "Failed to fetch orders", error: error.message });
    }
});

router.put('/:id/status', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const orderId = Number(req.params.id);
        const { status } = req.body;

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order || order.tenantId !== tenantId) {
            return res.status(403).json({ message: "Order not found or access denied" });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: status }
        });

        res.status(200).json({
            success: true,
            message: "Order status updated",
            data: { ...updatedOrder, id: Number(updatedOrder.id), tenantId: Number(updatedOrder.tenantId) }
        });
    } catch (error) {
        console.error("Update Order Status Error:", error);
        res.status(500).json({ message: "Failed to update order status", error: error.message });
    }
});

export default router;
