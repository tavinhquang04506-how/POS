import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const permissionsData = [
    { TenQuyen: 'VIEW_OVERVIEW', MoTa: 'Xem Tổng quan KPI' },
    { TenQuyen: 'VIEW_REVENUE', MoTa: 'Xem Báo cáo doanh thu' },
    { TenQuyen: 'VIEW_INVENTORY', MoTa: 'Xem Tồn kho' },
    { TenQuyen: 'EDIT_INVENTORY', MoTa: 'Nhập hàng' },
    { TenQuyen: 'VIEW_PRODUCTS', MoTa: 'Xem Danh mục sản phẩm' },
    { TenQuyen: 'EDIT_PRODUCTS', MoTa: 'Thêm/Sửa/Xóa Sản phẩm' },
    { TenQuyen: 'VIEW_CUSTOMERS', MoTa: 'Xem Khách hàng' },
    { TenQuyen: 'EDIT_CUSTOMERS', MoTa: 'Thêm/Sửa Khách hàng' },
    { TenQuyen: 'VIEW_TIERS', MoTa: 'Xem Hạng hội viên' },
    { TenQuyen: 'EDIT_TIERS', MoTa: 'Thêm/Sửa/Xóa Hạng hội viên' },
    { TenQuyen: 'VIEW_SHIFTS', MoTa: 'Xem Ca làm việc' },
    { TenQuyen: 'EDIT_SHIFTS', MoTa: 'Mở/Đóng Ca' },
    { TenQuyen: 'VIEW_RETURNS', MoTa: 'Xem Lịch sử Đổi trả' },
    { TenQuyen: 'EDIT_RETURNS', MoTa: 'Xử lý Đổi trả' },
    { TenQuyen: 'VIEW_STAFF', MoTa: 'Xem Nhân sự' },
    { TenQuyen: 'EDIT_STAFF', MoTa: 'Quản lý Nhân sự' },
    { TenQuyen: 'CHECKOUT', MoTa: 'Thanh toán Hóa đơn' }
  ];

  const createdPermissions = [];
  for (const p of permissionsData) {
    const perm = await prisma.permission.upsert({
      where: { TenQuyen: p.TenQuyen },
      update: {},
      create: p,
    });
    createdPermissions.push(perm);
  }

  const rolesData = [
    {
      TenRole: 'MANAGER',
      permissions: createdPermissions.map(p => p.TenQuyen) 
    },
    {
      TenRole: 'CASHIER',
      permissions: [
        'VIEW_PRODUCTS', 'VIEW_CUSTOMERS', 'EDIT_CUSTOMERS', 
        'VIEW_TIERS', 'VIEW_SHIFTS', 'EDIT_SHIFTS', 
        'VIEW_RETURNS', 'EDIT_RETURNS', 'CHECKOUT'
      ]
    },
    {
      TenRole: 'WAREHOUSE',
      permissions: [
        'VIEW_INVENTORY', 'EDIT_INVENTORY', 'VIEW_PRODUCTS', 'VIEW_STAFF', 'EDIT_STAFF' 
      ]
    }
  ];

  for (const r of rolesData) {
    const role = await prisma.groupRole.upsert({
      where: { TenRole: r.TenRole },
      update: {},
      create: {
        TenRole: r.TenRole,
        MoTa: r.TenRole + ' Role',
      }
    });

    const permsToLink = createdPermissions.filter(p => r.permissions.includes(p.TenQuyen));
    for (const p of permsToLink) {
      await prisma.role_Permission.upsert({
        where: { MaRole_MaQuyen: { MaRole: role.MaRole, MaQuyen: p.MaQuyen } },
        update: {},
        create: {
          MaRole: role.MaRole,
          MaQuyen: p.MaQuyen
        }
      });
    }
  }

  const staff = await prisma.nhanVien.findMany();
  const dbRoles = await prisma.groupRole.findMany();
  for (const s of staff) {
    if (s.VaiTro && !s.MaRole) {
      const matchRole = dbRoles.find(r => r.TenRole.toLowerCase() === s.VaiTro?.toLowerCase());
      if (matchRole) {
        await prisma.nhanVien.update({
          where: { MaNV: s.MaNV },
          data: { MaRole: matchRole.MaRole }
        });
      }
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
