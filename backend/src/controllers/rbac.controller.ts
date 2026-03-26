import { Request, Response } from 'express';
import { prisma } from '../index';

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.groupRole.findMany({
      include: {
        Role_Permissions: {
          include: { Permission: true }
        }
      }
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách vai trò' });
  }
};

export const updateRolePermissions = async (req: Request, res: Response) => {
  try {
    const roleId = parseInt(req.params.id as string);
    const { permissions } = req.body; 

    await prisma.role_Permission.deleteMany({
      where: { MaRole: roleId }
    });

    if (permissions && permissions.length > 0) {
      const data = permissions.map((pId: number) => ({
        MaRole: roleId,
        MaQuyen: pId
      }));
      await prisma.role_Permission.createMany({ data });
    }

    res.json({ message: 'Cập nhật phân quyền thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi cập nhật phân quyền' });
  }
};

export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const perms = await prisma.permission.findMany();
    res.json(perms);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách quyền' });
  }
};
