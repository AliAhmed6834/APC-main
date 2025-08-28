import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useSupplierAuth } from '../contexts/SupplierAuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Building2, Lock, Mail, User, Car, Shield } from 'lucide-react';

const SupplierLogin: React.FC = () => {
  const [, setLocation] = useLocation();
  const { login, register, isLoading } = useSupplierAuth();
  const [activeTab, setActiveTab] = useState('login');

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    supplierId: '',
    role: 'manager' as 'owner' | 'manager' | 'staff',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(loginData.email, loginData.password);
    if (success) {
      setLocation('/supplier/dashboard');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      // Handle password mismatch
      return;
    }
    
    const success = await register({
      email: registerData.email,
      password: registerData.password,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      supplierId: registerData.supplierId || undefined,
      role: registerData.role,
    });
    
    if (success) {
      setActiveTab('login');
      setRegisterData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        supplierId: '',
        role: 'manager',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Info */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Supplier Portal</h1>
                <p className="text-gray-600">Manage your parking facilities</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Car className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">Manage parking lots and pricing</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">Track bookings and revenue</span>
              </div>
              <div className="flex items-center space-x-3">
                <Lock className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700">Secure access and analytics</span>
              </div>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="font-semibold text-gray-900 mb-3">Why join our platform?</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Badge className="mt-1 bg-green-100 text-green-800">✓</Badge>
                <div>
                  <p className="text-sm font-medium text-gray-900">Increased Visibility</p>
                  <p className="text-xs text-gray-600">Reach more customers through our platform</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Badge className="mt-1 bg-green-100 text-green-800">✓</Badge>
                <div>
                  <p className="text-sm font-medium text-gray-900">Easy Management</p>
                  <p className="text-xs text-gray-600">Simple tools to manage your operations</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Badge className="mt-1 bg-green-100 text-green-800">✓</Badge>
                <div>
                  <p className="text-sm font-medium text-gray-900">Real-time Analytics</p>
                  <p className="text-xs text-gray-600">Track performance and optimize pricing</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
              <CardDescription className="text-center">
                Access your supplier dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="firstName"
                            placeholder="First name"
                            value={registerData.firstName}
                            onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Last name"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="registerEmail">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="registerEmail"
                          type="email"
                          placeholder="Enter your email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="registerPassword">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="registerPassword"
                          type="password"
                          placeholder="Create a password"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="supplierId">Supplier ID (Optional)</Label>
                      <Input
                        id="supplierId"
                        placeholder="Enter supplier ID if you have one"
                        value={registerData.supplierId}
                        onChange={(e) => setRegisterData({ ...registerData, supplierId: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <select
                        id="role"
                        value={registerData.role}
                        onChange={(e) => setRegisterData({ ...registerData, role: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="manager">Manager</option>
                        <option value="owner">Owner</option>
                        <option value="staff">Staff</option>
                      </select>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              
              <Separator className="my-6" />
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Need help?{' '}
                  <a href="/contact" className="text-blue-600 hover:underline">
                    Contact support
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupplierLogin; 