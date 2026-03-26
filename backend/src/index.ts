import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import * as authController from './controllers/auth.controller';
import * as productController from './controllers/product.controller';
import * as customerController from './controllers/customer.controller';
import * as checkoutController from './controllers/checkout.controller';
import * as shiftController from './controllers/shift.controller';
import * as tierController from './controllers/tier.controller';
import * as reportController from './controllers/report.controller';
import * as categoryController from './controllers/category.controller';
import * as inventoryController from './controllers/inventory.controller';
import * as staffController from './controllers/staff.controller';
import * as returnsController from './controllers/returns.controller';
import * as rbacController from './controllers/rbac.controller';
import { authenticate, authorizeRoles, authorizePermissions } from './middleware/auth.middleware';
import path from 'path';
import fs from 'fs';

// Database URL - dùng biến môi trường, không cần Electron
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';

export const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/auth/login', authController.login);
app.post('/api/auth/customer-login', authController.customerLogin);
app.put('/api/auth/change-password', authenticate, authController.changePassword);
app.get('/api/auth/me', authenticate, authController.getMe);

// Products
app.get('/api/products', authenticate, authorizePermissions(['VIEW_PRODUCTS']), productController.getProducts);
app.get('/api/products/:id', authenticate, authorizePermissions(['VIEW_PRODUCTS']), productController.getProductByBarcode);
app.post('/api/products', authenticate, authorizePermissions(['EDIT_PRODUCTS']), productController.createProduct);
app.put('/api/products/:id', authenticate, authorizePermissions(['EDIT_PRODUCTS']), productController.updateProduct);
app.delete('/api/products/:id', authenticate, authorizePermissions(['EDIT_PRODUCTS']), productController.deleteProduct);

// Categories
app.get('/api/categories', authenticate, authorizePermissions(['VIEW_PRODUCTS']), categoryController.getCategories);
app.post('/api/categories', authenticate, authorizePermissions(['EDIT_PRODUCTS']), categoryController.createCategory);
app.put('/api/categories/:id', authenticate, authorizePermissions(['EDIT_PRODUCTS']), categoryController.updateCategory);
app.delete('/api/categories/:id', authenticate, authorizePermissions(['EDIT_PRODUCTS']), categoryController.deleteCategory);

// Customers
app.get('/api/customers/me/history', authenticate, authorizeRoles(['CUSTOMER']), customerController.getMyHistory);
app.get('/api/customers/:phone', authenticate, authorizePermissions(['VIEW_CUSTOMERS']), customerController.getCustomerByPhone);
app.get('/api/customers', authenticate, authorizePermissions(['VIEW_CUSTOMERS']), customerController.getAllCustomers);
app.post('/api/customers', authenticate, authorizePermissions(['EDIT_CUSTOMERS']), customerController.createCustomer);
app.put('/api/customers/:id', authenticate, authorizePermissions(['EDIT_CUSTOMERS']), customerController.updateCustomer);

// Loyalty Tiers
app.get('/api/tiers', authenticate, authorizePermissions(['VIEW_TIERS']), tierController.getTiers);
app.post('/api/tiers', authenticate, authorizePermissions(['EDIT_TIERS']), tierController.createTier);
app.put('/api/tiers/:id', authenticate, authorizePermissions(['EDIT_TIERS']), tierController.updateTier);
app.delete('/api/tiers/:id', authenticate, authorizePermissions(['EDIT_TIERS']), tierController.deleteTier);

// Shifts
app.get('/api/shifts/current', authenticate, authorizePermissions(['VIEW_SHIFTS']), shiftController.getCurrentShift);
app.get('/api/shifts', authenticate, authorizePermissions(['VIEW_SHIFTS']), shiftController.getAllShifts);
app.post('/api/shifts/open', authenticate, authorizePermissions(['EDIT_SHIFTS']), shiftController.openShift);
app.post('/api/shifts/close', authenticate, authorizePermissions(['EDIT_SHIFTS']), shiftController.closeShift);

// Reports & Invoices
app.get('/api/reports/revenue-daily', authenticate, authorizePermissions(['VIEW_REVENUE']), reportController.getDailyRevenue);
app.get('/api/reports/revenue', authenticate, authorizePermissions(['VIEW_REVENUE']), reportController.getReportsAndInvoices);
app.get('/api/invoices', authenticate, authorizePermissions(['VIEW_RETURNS', 'CHECKOUT']), reportController.getReportsAndInvoices); 

// Returns
app.get('/api/returns', authenticate, authorizePermissions(['VIEW_RETURNS']), returnsController.getAllReturns);
app.get('/api/returns/invoice/:id', authenticate, authorizePermissions(['VIEW_RETURNS', 'EDIT_RETURNS']), returnsController.getInvoiceForReturn);
app.post('/api/returns', authenticate, authorizePermissions(['EDIT_RETURNS']), returnsController.createReturn);

// Inventory
app.get('/api/inventory/alerts', authenticate, authorizePermissions(['VIEW_INVENTORY']), inventoryController.getInventoryAlerts);
app.get('/api/inventory', authenticate, authorizePermissions(['VIEW_INVENTORY']), inventoryController.getInventory);
app.post('/api/inventory/receive', authenticate, authorizePermissions(['EDIT_INVENTORY']), inventoryController.receiveGoods);
app.post('/api/inventory/import-excel', authenticate, authorizePermissions(['EDIT_INVENTORY']), inventoryController.importExcel);

// Staff Accounts
app.get('/api/staff', authenticate, authorizePermissions(['VIEW_STAFF']), staffController.getAllStaff);
app.post('/api/staff', authenticate, authorizePermissions(['EDIT_STAFF']), staffController.createStaff);
app.put('/api/staff/:id', authenticate, authorizePermissions(['EDIT_STAFF']), staffController.updateStaff);
app.delete('/api/staff/:id', authenticate, authorizePermissions(['EDIT_STAFF']), staffController.deleteStaff);

app.post('/api/checkout', authenticate, authorizePermissions(['CHECKOUT']), checkoutController.checkout);

// RBAC
app.get('/api/rbac/roles', authenticate, authorizePermissions(['VIEW_STAFF']), rbacController.getRoles);
app.put('/api/rbac/roles/:id/permissions', authenticate, authorizePermissions(['EDIT_STAFF']), rbacController.updateRolePermissions);
app.get('/api/rbac/permissions', authenticate, authorizePermissions(['VIEW_STAFF']), rbacController.getAllPermissions);

// Phục vụ frontend static files trong production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../../frontend/dist');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
