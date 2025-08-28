import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { supplierLoginSchema } from '@shared/schema';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Extend Express Request interface to include supplier user
declare global {
  namespace Express {
    interface Request {
      supplierUser?: any;
    }
  }
}

export interface SupplierAuthRequest extends Request {
  supplierUser?: any;
}

// Middleware to check if supplier is authenticated
export const isSupplierAuthenticated = async (req: SupplierAuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.supplierToken;
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const session = await storage.getSupplierSession(token);
    if (!session || new Date() > session.expiresAt) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    const supplierUser = await storage.getSupplierUser(session.supplierUserId);
    if (!supplierUser || !supplierUser.isActive) {
      return res.status(401).json({ message: 'User account is inactive' });
    }

    req.supplierUser = supplierUser;
    next();
  } catch (error) {
    console.error('Supplier authentication error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

// Middleware to check if supplier has specific role
export const requireSupplierRole = (roles: string[]) => {
  return (req: SupplierAuthRequest, res: Response, next: NextFunction) => {
    if (!req.supplierUser) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.supplierUser.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Helper function to generate secure token
export const generateSupplierToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Helper function to hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Helper function to verify password
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
}; 