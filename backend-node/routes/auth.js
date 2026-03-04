import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || '472D4B6150645367566B5970337336763979244226452948404D6351';

// Register specific DTO structure
// { tenantName, name, email, password, role }
router.post('/register', async (req, res) => {
    try {
        const { tenantName, name, email, password, role } = req.body;

        // 1. Create Tenant
        const domain = tenantName.toLowerCase().replace(/\s+/g, '');
        const tenant = await prisma.tenant.create({
            data: {
                name: tenantName,
                domain: domain,
                active: true
            }
        });

        // 2. Auto-generate 14 Day Trial
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 14);

        await prisma.subscription.create({
            data: {
                tenantId: tenant.id,
                planType: 'TRIAL',
                status: 'ACTIVE',
                startDate: startDate,
                endDate: endDate
            }
        });

        // 3. Create Admin User
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                role: role || 'ADMIN',
                tenantId: tenant.id
            }
        });

        // 4. Generate JWT
        const token = jwt.sign(
            { sub: user.email, tenantId: tenant.id, id: user.id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(400).json({ message: "Registration failed", error: error.message });
    }
});

router.post('/authenticate', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { tenant: true } // Need tenant context
        });

        if (!user) {
            return res.status(403).json({ message: "Invalid credentials" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(403).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { sub: user.email, tenantId: user.tenantId, id: user.id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId
        });
    } catch (error) {
        console.error("Authentication Error:", error);
        res.status(500).json({ message: "Authentication failed", error: error.message });
    }
});

export default router;
