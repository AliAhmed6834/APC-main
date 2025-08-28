import { Request, Response, NextFunction } from 'express';
import { SupplierAuthService, type SupplierSession } from '../supplierAuth';

export interface SupplierRequest extends Request {
  supplier?: SupplierSession;
}

/**
 * Middleware to authenticate supplier users
 */
export const isSupplierAuthenticated = async (
  req: SupplierRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const sessionToken = req.cookies?.supplier_session;

    if (!authHeader && !sessionToken) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'SUPPLIER_AUTH_REQUIRED'
      });
    }

    // Try to get token from Authorization header or cookie
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : sessionToken;

    if (!token) {
      return res.status(401).json({ 
        message: 'Invalid authentication token',
        code: 'INVALID_TOKEN'
      });
    }

    // Validate session
    const session = await SupplierAuthService.validateSession(token);
    if (!session) {
      return res.status(401).json({ 
        message: 'Session expired or invalid',
        code: 'SESSION_EXPIRED'
      });
    }

    // Add supplier context to request
    req.supplier = session;
    next();
  } catch (error) {
    console.error('Supplier authentication error:', error);
    return res.status(500).json({ 
      message: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware to check if supplier has specific role
 */
export const requireSupplierRole = (allowedRoles: string[]) => {
  return (req: SupplierRequest, res: Response, next: NextFunction) => {
    if (!req.supplier) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'SUPPLIER_AUTH_REQUIRED'
      });
    }

    if (!allowedRoles.includes(req.supplier.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

/**
 * Middleware to check if supplier owns the resource
 */
export const requireSupplierOwnership = (resourceSupplierIdField: string) => {
  return (req: SupplierRequest, res: Response, next: NextFunction) => {
    if (!req.supplier) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'SUPPLIER_AUTH_REQUIRED'
      });
    }

    const resourceSupplierId = req.body[resourceSupplierIdField] || req.params[resourceSupplierIdField];
    
    if (resourceSupplierId !== req.supplier.supplierId) {
      return res.status(403).json({ 
        message: 'Access denied - resource ownership required',
        code: 'OWNERSHIP_REQUIRED'
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware - doesn't fail if no auth provided
 */
export const optionalSupplierAuth = async (
  req: SupplierRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const sessionToken = req.cookies?.supplier_session;

    if (!authHeader && !sessionToken) {
      return next(); // Continue without authentication
    }

    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : sessionToken;

    if (token) {
      const session = await SupplierAuthService.validateSession(token);
      if (session) {
        req.supplier = session;
      }
    }

    next();
  } catch (error) {
    console.error('Optional supplier authentication error:', error);
    next(); // Continue even if auth fails
  }
}; 