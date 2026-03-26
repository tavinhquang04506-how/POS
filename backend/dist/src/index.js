"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const authController = __importStar(require("./controllers/auth.controller"));
const productController = __importStar(require("./controllers/product.controller"));
const customerController = __importStar(require("./controllers/customer.controller"));
const checkoutController = __importStar(require("./controllers/checkout.controller"));
const shiftController = __importStar(require("./controllers/shift.controller"));
const tierController = __importStar(require("./controllers/tier.controller"));
const reportController = __importStar(require("./controllers/report.controller"));
const categoryController = __importStar(require("./controllers/category.controller"));
const inventoryController = __importStar(require("./controllers/inventory.controller"));
const staffController = __importStar(require("./controllers/staff.controller"));
const returnsController = __importStar(require("./controllers/returns.controller"));
const rbacController = __importStar(require("./controllers/rbac.controller"));
const auth_middleware_1 = require("./middleware/auth.middleware");
const path_1 = __importDefault(require("path"));
// Database URL - dùng biến môi trường, không cần Electron
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';
exports.prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post('/api/auth/login', authController.login);
app.post('/api/auth/customer-login', authController.customerLogin);
app.put('/api/auth/change-password', auth_middleware_1.authenticate, authController.changePassword);
app.get('/api/auth/me', auth_middleware_1.authenticate, authController.getMe);
// Products
app.get('/api/products', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['VIEW_PRODUCTS']), productController.getProducts);
app.get('/api/products/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['VIEW_PRODUCTS']), productController.getProductByBarcode);
app.post('/api/products', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_PRODUCTS']), productController.createProduct);
app.put('/api/products/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_PRODUCTS']), productController.updateProduct);
app.delete('/api/products/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_PRODUCTS']), productController.deleteProduct);
// Categories
app.get('/api/categories', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['VIEW_PRODUCTS']), categoryController.getCategories);
app.post('/api/categories', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_PRODUCTS']), categoryController.createCategory);
app.put('/api/categories/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_PRODUCTS']), categoryController.updateCategory);
app.delete('/api/categories/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_PRODUCTS']), categoryController.deleteCategory);
// Customers
app.get('/api/customers/me/history', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRoles)(['CUSTOMER']), customerController.getMyHistory);
app.get('/api/customers/:phone', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['VIEW_CUSTOMERS']), customerController.getCustomerByPhone);
app.get('/api/customers', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['VIEW_CUSTOMERS']), customerController.getAllCustomers);
app.post('/api/customers', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_CUSTOMERS']), customerController.createCustomer);
app.put('/api/customers/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_CUSTOMERS']), customerController.updateCustomer);
// Loyalty Tiers
app.get('/api/tiers', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['VIEW_TIERS']), tierController.getTiers);
app.post('/api/tiers', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_TIERS']), tierController.createTier);
app.put('/api/tiers/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_TIERS']), tierController.updateTier);
app.delete('/api/tiers/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_TIERS']), tierController.deleteTier);
// Shifts
app.get('/api/shifts/current', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['VIEW_SHIFTS']), shiftController.getCurrentShift);
app.get('/api/shifts', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['VIEW_SHIFTS']), shiftController.getAllShifts);
app.post('/api/shifts/open', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_SHIFTS']), shiftController.openShift);
app.post('/api/shifts/close', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_SHIFTS']), shiftController.closeShift);
// Reports & Invoices
app.get('/api/reports/revenue-daily', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['VIEW_REVENUE']), reportController.getDailyRevenue);
app.get('/api/reports/revenue', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['VIEW_REVENUE']), reportController.getReportsAndInvoices);
app.get('/api/invoices', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['VIEW_RETURNS', 'CHECKOUT']), reportController.getReportsAndInvoices);
// Returns
app.get('/api/returns', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['VIEW_RETURNS']), returnsController.getAllReturns);
app.get('/api/returns/invoice/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['VIEW_RETURNS', 'EDIT_RETURNS']), returnsController.getInvoiceForReturn);
app.post('/api/returns', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_RETURNS']), returnsController.createReturn);
// Inventory
app.get('/api/inventory/alerts', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['VIEW_INVENTORY']), inventoryController.getInventoryAlerts);
app.get('/api/inventory', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['VIEW_INVENTORY']), inventoryController.getInventory);
app.post('/api/inventory/receive', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_INVENTORY']), inventoryController.receiveGoods);
app.post('/api/inventory/import-excel', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_INVENTORY']), inventoryController.importExcel);
// Staff Accounts
app.get('/api/staff', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['VIEW_STAFF']), staffController.getAllStaff);
app.post('/api/staff', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_STAFF']), staffController.createStaff);
app.put('/api/staff/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_STAFF']), staffController.updateStaff);
app.delete('/api/staff/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_STAFF']), staffController.deleteStaff);
app.post('/api/checkout', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['CHECKOUT']), checkoutController.checkout);
// RBAC
app.get('/api/rbac/roles', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['VIEW_STAFF']), rbacController.getRoles);
app.put('/api/rbac/roles/:id/permissions', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['EDIT_STAFF']), rbacController.updateRolePermissions);
app.get('/api/rbac/permissions', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizePermissions)(['VIEW_STAFF']), rbacController.getAllPermissions);
// Phục vụ frontend static files trong production
if (process.env.NODE_ENV === 'production') {
    const frontendPath = path_1.default.join(__dirname, '../../../frontend/dist');
    app.use(express_1.default.static(frontendPath));
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(frontendPath, 'index.html'));
    });
}
const PORT = process.env.PORT || 3000;
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
