"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizePermissions = exports.authorizeRoles = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    try {
        const secret = process.env.JWT_SECRET || 'pos_super_secret_key_2024';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};
exports.authenticate = authenticate;
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied. You do not have permission.' });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
const authorizePermissions = (perms) => {
    return (req, res, next) => {
        if (!req.user)
            return res.status(403).json({ error: 'Access denied.' });
        if (req.user.role === 'CUSTOMER')
            return (0, exports.authorizeRoles)(['CUSTOMER'])(req, res, next);
        const userPerms = req.user.permissions || [];
        const hasPermission = perms.some(p => userPerms.includes(p));
        if (!hasPermission) {
            return res.status(403).json({ error: 'Access denied. Missing required permission.' });
        }
        next();
    };
};
exports.authorizePermissions = authorizePermissions;
