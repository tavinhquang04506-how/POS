"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const index_1 = require("../index");
const getCategories = async (req, res) => {
    try {
        const categories = await index_1.prisma.loaiHang.findMany({
            include: {
                _count: { select: { SanPhams: true } }
            }
        });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const { TenLoai, Mota } = req.body;
        const cat = await index_1.prisma.loaiHang.create({ data: { TenLoai, Mota } });
        res.json(cat);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { TenLoai, Mota } = req.body;
        const cat = await index_1.prisma.loaiHang.update({
            where: { MaLoai: Number(id) },
            data: { TenLoai, Mota }
        });
        res.json(cat);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update category' });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.loaiHang.delete({ where: { MaLoai: Number(id) } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete category (khả năng do ràng buộc khóa ngoại' });
    }
};
exports.deleteCategory = deleteCategory;
