import express from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prismaClient.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

// Middleware to check if user is ADMIN
const verifyAdminAccess = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ message: "Only ADMIN users can manage staff" });
        }
        req.userEntity = user; // pass the fetched user forward
        next();
    } catch (error) {
        res.status(500).json({ message: "Authorization verification failed", error: error.message });
    }
};

router.post('/', verifyAdminAccess, async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const { name, email, password, role } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already active" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                tenantId: tenantId,
                name,
                email,
                password: hashedPassword,
                role
            }
        });

        res.status(200).json({
            success: true,
            message: "Staff member created successfully",
            data: { id: Number(newUser.id), name: newUser.name, email: newUser.email, role: newUser.role, tenantId: Number(newUser.tenantId) }
        });
    } catch (error) {
        console.error("Create Staff Error:", error);
        res.status(500).json({ message: "Failed to create staff", error: error.message });
    }
});

router.get('/', verifyAdminAccess, async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const staff = await prisma.user.findMany({
            where: { tenantId }
        });

        const formatted = staff.map(u => ({
            id: Number(u.id),
            name: u.name,
            email: u.email,
            role: u.role,
            tenantId: Number(u.tenantId)
        }));

        res.status(200).json({
            success: true,
            message: "Staff members fetched",
            data: formatted
        });
    } catch (error) {
        console.error("Get Staff Error:", error);
        res.status(500).json({ message: "Failed to fetch staff", error: error.message });
    }
});

router.put('/:id', verifyAdminAccess, async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const id = Number(req.params.id);
        const { name, email, password, role } = req.body;

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user || user.tenantId !== tenantId) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        const dataToUpdate = { name, email, role };
        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: dataToUpdate
        });

        res.status(200).json({
            success: true,
            message: "Staff member updated",
            data: {
                id: Number(updatedUser.id),
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                tenantId: Number(updatedUser.tenantId)
            }
        });
    } catch (error) {
        console.error("Update Staff Error:", error);
        res.status(500).json({ message: "Failed to update staff", error: error.message });
    }
});

router.delete('/:id', verifyAdminAccess, async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const id = Number(req.params.id);

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user || user.tenantId !== tenantId) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        if (user.id === req.user.userId) {
            return res.status(400).json({ message: "Cannot delete your own admin account" });
        }

        await prisma.user.delete({ where: { id } });

        res.status(200).json({
            success: true,
            message: "Staff member deleted",
            data: null
        });
    } catch (error) {
        console.error("Delete Staff Error:", error);
        res.status(500).json({ message: "Failed to delete staff", error: error.message });
    }
});

export default router;
