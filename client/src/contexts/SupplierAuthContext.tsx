import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '../hooks/use-toast';

interface SupplierUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  supplierId: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface SupplierSession {
  supplierUserId: string;
  supplierId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

interface SupplierAuthContextType {
  supplier: SupplierUser | null;
  session: SupplierSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
  refreshSession: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  supplierId?: string;
  role?: 'owner' | 'manager' | 'staff';
}

const SupplierAuthContext = createContext<SupplierAuthContextType | undefined>(undefined);

export const useSupplierAuth = () => {
  const context = useContext(SupplierAuthContext);
  if (context === undefined) {
    throw new Error('useSupplierAuth must be used within a SupplierAuthProvider');
  }
  return context;
};

interface SupplierAuthProviderProps {
  children: ReactNode;
}

export const SupplierAuthProvider: React.FC<SupplierAuthProviderProps> = ({ children }) => {
  const [supplier, setSupplier] = useState<SupplierUser | null>(null);
  const [session, setSession] = useState<SupplierSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!supplier && !!session;

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/supplier/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
        return false;
      }

      setSupplier(data.user);
      setSession({
        supplierUserId: data.user.id,
        supplierId: data.user.supplierId,
        email: data.user.email,
        role: data.user.role,
        iat: Date.now(),
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.firstName}!`,
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/supplier/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setSupplier(null);
      setSession(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/supplier/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Registration Failed",
          description: data.message || "Registration failed",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully",
      });

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async (): Promise<void> => {
    try {
      const response = await fetch('/api/supplier/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSupplier(data.user);
        setSession(data.user);
      } else {
        setSupplier(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      setSupplier(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const value: SupplierAuthContextType = {
    supplier,
    session,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    refreshSession,
  };

  return (
    <SupplierAuthContext.Provider value={value}>
      {children}
    </SupplierAuthContext.Provider>
  );
}; 