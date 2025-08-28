import crypto from 'crypto';
import { storage } from './storage';
import type { SupplierUser, InsertSupplierUser } from '@shared/schema';

export interface SupplierAuthResult {
  success: boolean;
  user?: SupplierUser;
  sessionToken?: string;
  error?: string;
}

export interface SupplierSession {
  supplierUserId: string;
  supplierId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export class SupplierAuthService {
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly SALT_ROUNDS = 12;

  /**
   * Register a new supplier user
   */
  static async registerSupplierUser(userData: Omit<InsertSupplierUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupplierAuthResult> {
    try {
      // Check if user already exists
      const existingUser = await storage.getSupplierUserByEmail(userData.email);

      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      // Hash password if provided
      let hashedPassword: string | undefined;
      if (userData.password) {
        // For now, we'll use a simple hash since bcryptjs isn't available
        hashedPassword = crypto.createHash('sha256').update(userData.password).digest('hex');
        console.log('Registration password hashing:');
        console.log('Original password:', userData.password);
        console.log('Hashed password:', hashedPassword);
      }

      // Create user
      console.log('About to create supplier user with data:', { ...userData, password: '[HIDDEN]' });
      const newUser = await storage.createSupplierUser({
        ...userData,
        password: hashedPassword,
      });
      console.log('Successfully created supplier user:', newUser.email);

      return {
        success: true,
        user: newUser
      };
    } catch (error) {
      console.error('Error registering supplier user:', error);
      return {
        success: false,
        error: 'Failed to register user'
      };
    }
  }

  /**
   * Authenticate supplier user
   */
  static async login(email: string, password: string): Promise<SupplierAuthResult> {
    try {
      console.log('Attempting login for email:', email);
      
      // Find user
      const supplierUser = await storage.getSupplierUserByEmail(email);

      console.log('Found user:', supplierUser ? 'yes' : 'no');

      if (!supplierUser) {
        console.log('No user found with email:', email);
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // Check if user is active
      if (!supplierUser.isActive) {
        return {
          success: false,
          error: 'Account is deactivated'
        };
      }

      // Verify password
      if (supplierUser.password) {
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        console.log('Password verification:');
        console.log('Input password:', password);
        console.log('Stored hashed password:', supplierUser.password);
        console.log('Generated hashed password:', hashedPassword);
        console.log('Passwords match:', hashedPassword === supplierUser.password);
        
        if (hashedPassword !== supplierUser.password) {
          console.log('Password mismatch!');
          return {
            success: false,
            error: 'Invalid credentials'
          };
        }
      } else {
        console.log('No password stored for user');
      }

      // Create session
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION);

      await storage.createSupplierSession({
        supplierUserId: supplierUser.id,
        sessionToken,
        expiresAt,
        email: supplierUser.email, // Add email to session for easier lookup
      });

      // Update last login
      await storage.updateSupplierUser(supplierUser.id, { lastLoginAt: new Date() });

      return {
        success: true,
        user: supplierUser,
        sessionToken
      };
    } catch (error) {
      console.error('Error during supplier login:', error);
      return {
        success: false,
        error: 'Login failed'
      };
    }
  }

  /**
   * Validate supplier session
   */
  static async validateSession(sessionToken: string): Promise<SupplierSession | null> {
    try {
      const sessionData = await storage.getSupplierSession(sessionToken);

      if (!sessionData) {
        return null;
      }

      // Check if session is expired
      if (sessionData.expiresAt < new Date()) {
        // Clean up expired session
        await this.logout(sessionToken);
        return null;
      }

      // Get user data
      const user = await storage.getSupplierUserByEmail(sessionData.email || '');
      if (!user) {
        return null;
      }

      // Check if user is still active
      if (!user.isActive) {
        await this.logout(sessionToken);
        return null;
      }

      return {
        supplierUserId: user.id,
        supplierId: user.supplierId,
        email: user.email,
        role: user.role,
        iat: sessionData.createdAt.getTime(),
        exp: sessionData.expiresAt.getTime(),
      };
    } catch (error) {
      console.error('Error validating supplier session:', error);
      return null;
    }
  }

  /**
   * Logout supplier user
   */
  static async logout(sessionToken: string): Promise<boolean> {
    try {
      await storage.deleteSupplierSession(sessionToken);
      return true;
    } catch (error) {
      console.error('Error during supplier logout:', error);
      return false;
    }
  }

  /**
   * Generate a secure session token
   */
  private static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      // For mock storage, we'll just log this
      console.log('Cleaning up expired sessions (mock storage)');
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
  }
} 