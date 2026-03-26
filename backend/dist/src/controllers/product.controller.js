"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductByBarcode = exports.getProducts = void 0;
const index_1 = require("../index");
const getProducts = async (req, res) => {
    try {
        const products = await index_1.prisma.sanPham.findMany({
            include: {
                LoaiHang: true,
                LoHangs: {
                    where: { SoLuongTon: { gt: 0 } },
                    orderBy: { HanSuDung: 'asc' }
                }
            }
        });
        res.json(products);
    }
    catch (error) {
        console.error('Error fetching products', error);
        res.status(500).json({ error: 'Failed to fetch products.' });
    }
};
exports.getProducts = getProducts;
const getProductByBarcode = async (req, res) => {
    try {
        const { id } = req.params;
        const MaSP = Number(id);
        if (isNaN(MaSP)) {
            return res.status(400).json({ error: 'Invalid product barcode' });
        }
        const product = await index_1.prisma.sanPham.findUnique({
            where: { MaSP },
            include: {
                LoHangs: {
                    where: { SoLuongTon: { gt: 0 } },
                    orderBy: { HanSuDung: 'asc' }
                }
            }
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        console.error('Error fetching product by barcode', error);
        res.status(500).json({ error: 'Failed to fetch product.' });
    }
};
exports.getProductByBarcode = getProductByBarcode;
const createProduct = async (req, res) => {
    try {
        const { TenSP, DonGiaBan, ThueVAT, SoLuongTon, MaLoai } = req.body;
        const product = await index_1.prisma.sanPham.create({
            data: { TenSP, DonGiaBan: Number(DonGiaBan), ThueVAT: Number(ThueVAT), SoLuongTon: Number(SoLuongTon || 0), MaLoai: Number(MaLoai) }
        });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { TenSP, DonGiaBan, ThueVAT, MaLoai } = req.body;
        const product = await index_1.prisma.sanPham.update({
            where: { MaSP: Number(id) },
            data: { TenSP, DonGiaBan: Number(DonGiaBan), ThueVAT: Number(ThueVAT), MaLoai: Number(MaLoai) }
        });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.sanPham.delete({ where: { MaSP: Number(id) } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete product (khả năng do ràng buộc hóa đơn/lô hàng)' });
    }
};
exports.deleteProduct = deleteProduct;
