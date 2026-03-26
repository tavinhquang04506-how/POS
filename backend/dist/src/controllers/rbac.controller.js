"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPermissions = exports.updateRolePermissions = exports.getRoles = void 0;
const index_1 = require("../index");
const getRoles = async (req, res) => {
    try {
        const roles = await index_1.prisma.groupRole.findMany({
            include: {
                Role_Permissions: {
                    include: { Permission: true }
                }
            }
        });
        res.json(roles);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi lấy danh sách vai trò' });
    }
};
exports.getRoles = getRoles;
const updateRolePermissions = async (req, res) => {
    try {
        const roleId = parseInt(req.params.id);
        const { permissions } = req.body;
        await index_1.prisma.role_Permission.deleteMany({
            where: { MaRole: roleId }
        });
        if (permissions && permissions.length > 0) {
            const data = permissions.map((pId) => ({
                MaRole: roleId,
                MaQuyen: pId
            }));
            await index_1.prisma.role_Permission.createMany({ data });
        }
        res.json({ message: 'Cập nhật phân quyền thành công' });
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi cập nhật phân quyền' });
    }
};
exports.updateRolePermissions = updateRolePermissions;
const getAllPermissions = async (req, res) => {
    try {
        const perms = await index_1.prisma.permission.findMany();
        res.json(perms);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi lấy danh sách quyền' });
    }
};
exports.getAllPermissions = getAllPermissions;
