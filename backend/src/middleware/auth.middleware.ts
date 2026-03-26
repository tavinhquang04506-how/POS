import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
    permissions?: string[];
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const secret = process.env.JWT_SECRET || 'pos_super_secret_key_2024';
    const decoded = jwt.verify(token, secret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

export const authorizeRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. You do not have permission.' });
    }
    next();
  };
};

export const authorizePermissions = (perms: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(403).json({ error: 'Access denied.' });
    if (req.user.role === 'CUSTOMER') return authorizeRoles(['CUSTOMER'])(req, res, next);
    
    const userPerms = req.user.permissions || [];
    const hasPermission = perms.some(p => userPerms.includes(p));
    if (!hasPermission) {
      return res.status(403).json({ error: 'Access denied. Missing required permission.' });
    }
    next();
  };
};
