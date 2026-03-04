import express from 'express';
import prisma from '../prismaClient.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all vendor routes
router.use(verifyToken);

// --- CATEGORY ROUTES ---

router.post('/category', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const { name, active } = req.body;

        const category = await prisma.category.create({
            data: {
                tenantId: tenantId,
                name: name,
                active: active !== undefined ? active : true
            }
        });

        res.status(200).json({
            success: true,
            message: "Category created",
            data: { ...category, id: Number(category.id), tenantId: Number(category.tenantId) }
        });
    } catch (error) {
        console.error("Create Category Error:", error);
        res.status(500).json({ message: "Failed to create category", error: error.message });
    }
});

router.get('/category', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const categories = await prisma.category.findMany({
            where: { tenantId: tenantId }
        });

        // Convert BigInts or Ints for JSON serialization safety just in case
        const formatted = categories.map(c => ({
            ...c,
            id: Number(c.id),
            tenantId: Number(c.tenantId)
        }));

        res.status(200).json({
            success: true,
            message: "Success",
            data: formatted
        });
    } catch (error) {
        console.error("Get Categories Error:", error);
        res.status(500).json({ message: "Failed to fetch categories", error: error.message });
    }
});

router.put('/category/:id', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const id = Number(req.params.id);
        const { name, active } = req.body;

        // Verify ownership
        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing || existing.tenantId !== tenantId) {
            return res.status(403).json({ message: "Category not found or access denied" });
        }

        const category = await prisma.category.update({
            where: { id },
            data: { name, active }
        });

        res.status(200).json({
            success: true,
            message: "Category updated",
            data: { ...category, id: Number(category.id), tenantId: Number(category.tenantId) }
        });
    } catch (error) {
        console.error("Update Category Error:", error);
        res.status(500).json({ message: "Failed to update category", error: error.message });
    }
});

router.delete('/category/:id', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const id = Number(req.params.id);

        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing || existing.tenantId !== tenantId) {
            return res.status(403).json({ message: "Category not found or access denied" });
        }

        // Soft delete
        await prisma.category.update({
            where: { id },
            data: { active: false }
        });

        res.status(200).json({
            success: true,
            message: "Category deactivated",
            data: null
        });
    } catch (error) {
        console.error("Delete Category Error:", error);
        res.status(500).json({ message: "Failed to deactivate category", error: error.message });
    }
});

// --- ITEM ROUTES ---

router.post('/item', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const { name, description, price, imageUrl, active, trackStock, stockQuantity, categoryId } = req.body;

        if (categoryId) {
            const cat = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
            if (!cat || cat.tenantId !== tenantId) {
                return res.status(403).json({ message: "Category not found or access denied" });
            }
        }

        const item = await prisma.item.create({
            data: {
                tenantId: tenantId,
                categoryId: categoryId ? Number(categoryId) : null,
                name,
                description,
                price: Number(price),
                imageUrl,
                active: active !== undefined ? active : true,
                trackStock: trackStock !== undefined ? trackStock : false,
                stockQuantity: stockQuantity ? Number(stockQuantity) : null
            }
        });

        res.status(200).json({
            success: true,
            message: "Item created",
            data: { ...item, id: Number(item.id), tenantId: Number(item.tenantId), categoryId: item.categoryId ? Number(item.categoryId) : null }
        });
    } catch (error) {
        console.error("Create Item Error:", error);
        res.status(500).json({ message: "Failed to create item", error: error.message });
    }
});

router.get('/item', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const items = await prisma.item.findMany({
            where: { tenantId: tenantId },
            include: { category: true } // Assuming frontend might need category data
        });

        const formatted = items.map(i => ({
            ...i,
            id: Number(i.id),
            tenantId: Number(i.tenantId),
            categoryId: i.categoryId ? Number(i.categoryId) : null,
            category: i.category ? { ...i.category, id: Number(i.category.id), tenantId: Number(i.category.tenantId) } : null
        }));

        res.status(200).json({
            success: true,
            message: "Success",
            data: formatted
        });
    } catch (error) {
        console.error("Get Items Error:", error);
        res.status(500).json({ message: "Failed to fetch items", error: error.message });
    }
});

router.put('/item/:id', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const id = Number(req.params.id);
        const { name, description, price, imageUrl, active, trackStock, stockQuantity, categoryId } = req.body;

        const existing = await prisma.item.findUnique({ where: { id } });
        if (!existing || existing.tenantId !== tenantId) {
            return res.status(403).json({ message: "Item not found or access denied" });
        }

        if (categoryId) {
            const cat = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
            if (!cat || cat.tenantId !== tenantId) {
                return res.status(403).json({ message: "Category not found or access denied" });
            }
        }

        const item = await prisma.item.update({
            where: { id },
            data: {
                categoryId: categoryId ? Number(categoryId) : null,
                name,
                description,
                price: Number(price),
                imageUrl,
                active,
                trackStock,
                stockQuantity: stockQuantity ? Number(stockQuantity) : null
            }
        });

        res.status(200).json({
            success: true,
            message: "Item updated",
            data: { ...item, id: Number(item.id), tenantId: Number(item.tenantId), categoryId: item.categoryId ? Number(item.categoryId) : null }
        });
    } catch (error) {
        console.error("Update Item Error:", error);
        res.status(500).json({ message: "Failed to update item", error: error.message });
    }
});

router.delete('/item/:id', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const id = Number(req.params.id);

        const existing = await prisma.item.findUnique({ where: { id } });
        if (!existing || existing.tenantId !== tenantId) {
            return res.status(403).json({ message: "Item not found or access denied" });
        }

        // Soft delete
        await prisma.item.update({
            where: { id },
            data: { active: false }
        });

        res.status(200).json({
            success: true,
            message: "Item deactivated",
            data: null
        });
    } catch (error) {
        console.error("Delete Item Error:", error);
        res.status(500).json({ message: "Failed to deactivate item", error: error.message });
    }
});

export default router;
