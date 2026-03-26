"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Require login for all product routes
router.use(auth_middleware_1.authenticate);
router.get('/', product_controller_1.getProducts);
router.get('/:id', product_controller_1.getProductByBarcode);
exports.default = router;
