import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const staff = await prisma.nhanVien.findMany({ select: { MaNV: true, HoTen: true, VaiTro: true } });
  console.log("=== THÔNG TIN TÀI KHOẢN NHÂN VIÊN ===");
  console.table(staff);
  
  const customers = await prisma.khachHang.findMany({ select: { MaKH: true, HoTen: true, SDT: true, DiemTichLuy: true } });
  console.log("\n=== THÔNG TIN TÀI KHOẢN KHÁCH HÀNG ===");
  console.table(customers);
}

main()
  .catch(e => { console.error(e); })
  .finally(async () => { await prisma.$disconnect(); });
