import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Users,
  Building2,
  CreditCard,
  Plane,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Shield,
  Database,
  Bell,
  Key,
  LogOut,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate?: string;
  createdAt: string;
}

interface Supplier {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phone?: string;
  isActive: boolean;
  totalParkingLots: number;
  totalBookings: number;
  totalRevenue: number;
  rating: number;
  createdAt: string;
}

interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  isActive: boolean;
  totalParkingLots: number;
  totalBookings: number;
}

interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  customerName: string;
  supplierName: string;
  createdAt: string;
}

interface Analytics {
  overview: {
    totalCustomers: number;
    totalSuppliers: number;
    totalBookings: number;
    totalRevenue: number;
    activeAirports: number;
    pendingPayments: number;
  };
  trends: {
    dailyBookings: number[];
    dailyRevenue: number[];
    customerGrowth: number;
    supplierGrowth: number;
  };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [airports, setAirports] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'customer' | 'supplier' | 'airport' | 'payment' | 'booking'>('customer');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const { toast } = useToast();

  // Booking filters state
  const [bookingFilters, setBookingFilters] = useState({
    status: 'all',
    airport: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // Filtered bookings
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);

  // Bookings state
  const [bookings, setBookings] = useState<any[]>([]);

  // Gateway settings state
  const [gatewayType, setGatewayType] = useState<'stripe' | 'paypal'>('stripe');
  const [gatewayApiKey, setGatewayApiKey] = useState('');
  const [gatewayApiSecret, setGatewayApiSecret] = useState('');
  const [gatewayEnabled, setGatewayEnabled] = useState(false);
  const [gatewayTestMode, setGatewayTestMode] = useState(false);
  const [gatewayLoading, setGatewayLoading] = useState(false);

  // Fetch gateway config when gatewayType changes
  useEffect(() => {
    const fetchConfig = async () => {
      setGatewayLoading(true);
      try {
        const res = await fetch(`/api/admin/gateway/${gatewayType}`);
        if (res.ok) {
          const config = await res.json();
          setGatewayEnabled(!!config.isActive);
          setGatewayTestMode(!!config.testMode);
          setGatewayApiKey(config.apiKeys?.public || '');
          setGatewayApiSecret(config.apiKeys?.secret || '');
        } else {
          // No config found, reset fields
          setGatewayEnabled(false);
          setGatewayTestMode(false);
          setGatewayApiKey('');
          setGatewayApiSecret('');
        }
      } catch (e) {
        setGatewayEnabled(false);
        setGatewayTestMode(false);
        setGatewayApiKey('');
        setGatewayApiSecret('');
      } finally {
        setGatewayLoading(false);
      }
    };
    fetchConfig();
  }, [gatewayType]);

  // Handle gateway save
  const handleGatewaySave = async (e: React.FormEvent) => {
    e.preventDefault();
    setGatewayLoading(true);
    try {
      // Check if config exists
      const res = await fetch(`/api/admin/gateway/${gatewayType}`);
      const exists = res.ok;
      const payload = {
        gatewayName: gatewayType,
        isActive: gatewayEnabled,
        testMode: gatewayTestMode,
        apiKeys: { public: gatewayApiKey, secret: gatewayApiSecret },
        webhookUrls: {},
        configOptions: {},
      };
      let saveRes;
      if (exists) {
        saveRes = await fetch(`/api/admin/gateway/${gatewayType}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        saveRes = await fetch(`/api/admin/gateway`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (saveRes.ok) {
        toast({
          title: 'Gateway Settings Saved',
          description: `Type: ${gatewayType}, Enabled: ${gatewayEnabled}, Test Mode: ${gatewayTestMode}`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save gateway settings.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save gateway settings.',
        variant: 'destructive',
      });
    } finally {
      setGatewayLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Initialize filtered bookings when bookings data changes
  useEffect(() => {
    setFilteredBookings(bookings);
  }, [bookings]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load all data in parallel
      const [analyticsData, customersData, suppliersData, airportsData, paymentsData, bookingsData] = await Promise.all([
        fetch('/api/admin/analytics').then(res => res.json()),
        fetch('/api/admin/customers').then(res => res.json()),
        fetch('/api/admin/suppliers').then(res => res.json()),
        fetch('/api/admin/airports').then(res => res.json()),
        fetch('/api/admin/payments').then(res => res.json()),
        fetch('/api/admin/bookings').then(res => res.json())
      ]);

      setAnalytics(analyticsData);
      setCustomers(customersData);
      setSuppliers(suppliersData);
      setAirports(airportsData);
      setPayments(paymentsData);
      setBookings(bookingsData);
      
      // Initialize filtered bookings with all bookings
      setFilteredBookings(bookingsData);
      
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle edit item
  const handleEdit = (item: any, type: 'customer' | 'supplier' | 'airport' | 'payment' | 'booking') => {
    setSelectedItem(item);
    setModalType(type);
    setIsModalOpen(true);
  };

  // Handle delete item
  const handleDelete = async (id: string, type: 'customer' | 'supplier' | 'airport' | 'payment' | 'booking') => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        const response = await fetch(`/api/admin/${type}s/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          toast({
            title: "Success",
            description: `${type} deleted successfully.`,
          });
          loadDashboardData(); // Reload data
        } else {
          throw new Error('Failed to delete');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to delete ${type}.`,
          variant: "destructive",
        });
      }
    }
  };

  // Apply booking filters
  const applyBookingFilters = () => {
    let filtered = [...bookings];
    
    if (bookingFilters.status && bookingFilters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === bookingFilters.status);
    }
    
    if (bookingFilters.airport && bookingFilters.airport !== 'all') {
      filtered = filtered.filter(booking => booking.airportId === bookingFilters.airport);
    }
    
    if (bookingFilters.dateFrom) {
      filtered = filtered.filter(booking => 
        new Date(booking.startDate) >= new Date(bookingFilters.dateFrom)
      );
    }
    
    if (bookingFilters.dateTo) {
      filtered = filtered.filter(booking => 
        new Date(booking.endDate) <= new Date(bookingFilters.dateTo)
      );
    }
    
    setFilteredBookings(filtered);
  };

  // Handle save item
  const handleSave = async (formData: any) => {
    try {
      const url = selectedItem 
        ? `/api/admin/${modalType}s/${selectedItem.id}`
        : `/api/admin/${modalType}s`;
      
      const method = selectedItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `${modalType} ${selectedItem ? 'updated' : 'created'} successfully.`,
        });
        setIsModalOpen(false);
        setSelectedItem(null);
        loadDashboardData(); // Reload data
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${selectedItem ? 'update' : 'create'} ${modalType}.`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your parking platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Shield className="w-4 h-4 mr-1" />
                Admin Access
              </Badge>
              <Button variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="airports">Airports</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.overview.totalCustomers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{analytics?.trends.customerGrowth || 0}% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.overview.totalSuppliers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{analytics?.trends.supplierGrowth || 0}% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.overview.totalBookings || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all airports
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(analytics?.overview.totalRevenue || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Platform earnings
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={() => { setModalType('customer'); setIsModalOpen(true); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Customer
                    </Button>
                    <Button onClick={() => { setModalType('supplier'); setIsModalOpen(true); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Supplier
                    </Button>
                    <Button onClick={() => { setModalType('airport'); setIsModalOpen(true); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Airport
                    </Button>
                    <Button variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Database Status</span>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Server Status</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Airports</span>
                      <span>{analytics?.overview.activeAirports || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Payments</span>
                      <span>{analytics?.overview.pendingPayments || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Customer Management</h2>
              <Button onClick={() => { setSelectedItem(null); setModalType('customer'); setIsModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customers.map((customer) => (
                        <tr key={customer.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {customer.firstName?.[0] || 'C'}{customer.lastName?.[0] || 'U'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {customer.firstName} {customer.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{customer.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.phone || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.totalBookings || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">
                              ${(customer.totalSpent || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(customer.isActive ? 'active' : 'inactive')}>
                              {customer.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(customer, 'customer')}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEdit(customer, 'customer')}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDelete(customer.id, 'customer')}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Supplier Management</h2>
              <Button onClick={() => { setSelectedItem(null); setModalType('supplier'); setIsModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Supplier
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parking Lots</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {suppliers.map((supplier) => (
                        <tr key={supplier.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-green-600">
                                    {supplier.firstName?.[0] || 'S'}{supplier.lastName?.[0] || 'U'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {supplier.firstName} {supplier.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{supplier.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{supplier.companyName || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{supplier.totalParkingLots || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{supplier.totalBookings || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">
                              ${(supplier.totalRevenue || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              <span className="text-sm text-gray-900">{(supplier.rating || 0).toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(supplier.isActive ? 'active' : 'inactive')}>
                              {supplier.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(supplier, 'supplier')}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEdit(supplier, 'supplier')}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDelete(supplier.id, 'supplier')}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Airports Tab */}
          <TabsContent value="airports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Airport Management</h2>
              <Button onClick={() => { setSelectedItem(null); setModalType('airport'); setIsModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Airport
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {airports.map((airport) => (
                <Card key={airport.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Plane className="w-5 h-5 mr-2 text-blue-600" />
                          {airport.code}
                        </CardTitle>
                        <CardDescription>{airport.name}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(airport.isActive ? 'active' : 'inactive')}>
                        {airport.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {airport.city}, {airport.country}
                      </div>
                      <div className="flex items-center text-sm">
                        <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                        {airport.totalParkingLots || 0} parking lots
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {airport.totalBookings || 0} bookings
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(airport, 'airport')}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(airport.id, 'airport')}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Payment Management</h2>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{payment.id?.slice(-8) || 'Unknown'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{payment.customerName || 'Unknown'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{payment.supplierName || 'Unknown'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">
                              ${payment.amount || 0} {payment.currency || 'USD'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{payment.paymentMethod || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(payment.status || 'pending')}>
                              {payment.status || 'Pending'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(payment, 'payment')}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <CreditCard className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Booking Management</h2>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="statusFilter">Status</Label>
                    <Select value={bookingFilters.status} onValueChange={(value) => setBookingFilters(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="airportFilter">Airport</Label>
                    <Select value={bookingFilters.airport} onValueChange={(value) => setBookingFilters(prev => ({ ...prev, airport: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Airports" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Airports</SelectItem>
                        {airports.map(airport => (
                          <SelectItem key={airport.id} value={airport.id}>
                            {airport.code} - {airport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="dateFrom">From Date</Label>
                    <Input 
                      id="dateFrom"
                      type="date" 
                      value={bookingFilters.dateFrom} 
                      onChange={(e) => setBookingFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dateTo">To Date</Label>
                    <Input 
                      id="dateTo"
                      type="date" 
                      value={bookingFilters.dateTo} 
                      onChange={(e) => setBookingFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setBookingFilters({ status: 'all', airport: 'all', dateFrom: '', dateTo: '' })}
                    >
                      Clear Filters
                    </Button>
                    <Button onClick={applyBookingFilters}>
                      Apply Filters
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Showing {filteredBookings.length} of {bookings.length} bookings
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bookings Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Airport</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parking Lot</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{booking.id?.slice(-8) || 'Unknown'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{booking.customerName || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{booking.customerEmail || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{booking.airportCode || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{booking.airportName || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{booking.parkingLotName || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{booking.parkingLotAddress || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              to {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">
                              ${booking.amount || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(booking.status || 'pending')}>
                              {booking.status || 'Pending'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(booking, 'booking')}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEdit(booking, 'booking')}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDelete(booking.id, 'booking')}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics & Reports</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Customers</span>
                      <span className="font-bold">{analytics?.overview.totalCustomers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Customers</span>
                      <span className="font-bold">{customers.filter(c => c.isActive).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New This Month</span>
                      <span className="font-bold text-green-600">+{analytics?.trends.customerGrowth || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Bookings per Customer</span>
                      <span className="font-bold">
                        {customers.length > 0 ? 
                          (customers.reduce((sum, c) => sum + (c.totalBookings || 0), 0) / customers.length).toFixed(1) : 
                          '0'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Supplier Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Suppliers</span>
                      <span className="font-bold">{analytics?.overview.totalSuppliers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Suppliers</span>
                      <span className="font-bold">{suppliers.filter(s => s.isActive).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New This Month</span>
                      <span className="font-bold text-green-600">+{analytics?.trends.supplierGrowth || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Rating</span>
                      <span className="font-bold">
                        {suppliers.length > 0 ? 
                          (suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.length).toFixed(1) : 
                          '0.0'
                        } ⭐
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">${(analytics?.overview.totalRevenue || 0).toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Total Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{analytics?.overview.totalBookings || 0}</div>
                      <div className="text-sm text-gray-500">Total Bookings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        ${analytics?.overview.totalRevenue && analytics?.overview.totalBookings ? 
                          (analytics.overview.totalRevenue / analytics.overview.totalBookings).toFixed(2) : 
                          '0.00'
                        }
                      </div>
                      <div className="text-sm text-gray-500">Average Booking Value</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{analytics?.overview.activeAirports || 0}</div>
                    <div className="text-sm text-gray-500">Active Airports</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">{analytics?.overview.pendingPayments || 0}</div>
                    <div className="text-sm text-gray-500">Pending Payments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {airports.reduce((sum, airport) => sum + (airport.totalParkingLots || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-500">Total Parking Lots</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-indigo-600">
                      {suppliers.reduce((sum, supplier) => sum + (supplier.totalRevenue || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Supplier Revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex flex-col gap-6">
              {/* Gateway Setting */}
              <Card>
                <CardHeader>
                  <CardTitle>Gateway Setting</CardTitle>
                  <CardDescription>Configure your payment gateway integration (e.g., Stripe, PayPal).</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleGatewaySave}>
                    <div>
                      <Label htmlFor="gatewayType">Gateway Type</Label>
                      <Select value={gatewayType} onValueChange={value => setGatewayType(value as 'stripe' | 'paypal')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Gateway" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="gatewayApiKey">API Key</Label>
                      <Input id="gatewayApiKey" value={gatewayApiKey} onChange={e => setGatewayApiKey(e.target.value)} placeholder="Enter API Key" />
                    </div>
                    <div>
                      <Label htmlFor="gatewayApiSecret">API Secret</Label>
                      <Input id="gatewayApiSecret" value={gatewayApiSecret} onChange={e => setGatewayApiSecret(e.target.value)} placeholder="Enter API Secret" type="password" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="gatewayEnabled" checked={gatewayEnabled} onCheckedChange={setGatewayEnabled} />
                      <Label htmlFor="gatewayEnabled">Enable Gateway</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="gatewayTestMode" checked={gatewayTestMode} onCheckedChange={setGatewayTestMode} />
                      <Label htmlFor="gatewayTestMode">Test Mode</Label>
                    </div>
                    <Button type="submit" disabled={gatewayLoading}>
                      {gatewayLoading ? 'Saving...' : 'Save Gateway Settings'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              {/* Other settings can go here */}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal for editing/creating items */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? `Edit ${modalType}` : `Add New ${modalType}`}
            </DialogTitle>
            <DialogDescription>
              {selectedItem ? `Update ${modalType} information` : `Create a new ${modalType}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {modalType === 'customer' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      defaultValue={selectedItem?.firstName || ''} 
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      defaultValue={selectedItem?.lastName || ''} 
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue={selectedItem?.email || ''} 
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    defaultValue={selectedItem?.phone || ''} 
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="isActive" defaultChecked={selectedItem?.isActive !== false} />
                  <Label htmlFor="isActive">Active Account</Label>
                </div>
              </div>
            )}

            {modalType === 'supplier' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      defaultValue={selectedItem?.firstName || ''} 
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      defaultValue={selectedItem?.lastName || ''} 
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue={selectedItem?.email || ''} 
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    defaultValue={selectedItem?.companyName || ''} 
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    defaultValue={selectedItem?.phone || ''} 
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="isActive" defaultChecked={selectedItem?.isActive !== false} />
                  <Label htmlFor="isActive">Active Account</Label>
                </div>
              </div>
            )}

            {modalType === 'airport' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Airport Code</Label>
                    <Input 
                      id="code" 
                      defaultValue={selectedItem?.code || ''} 
                      placeholder="e.g., LHR"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Airport Name</Label>
                    <Input 
                      id="name" 
                      defaultValue={selectedItem?.name || ''} 
                      placeholder="e.g., London Heathrow Airport"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      defaultValue={selectedItem?.city || ''} 
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input 
                      id="country" 
                      defaultValue={selectedItem?.country || ''} 
                      placeholder="Enter country"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="isActive" defaultChecked={selectedItem?.isActive !== false} />
                  <Label htmlFor="isActive">Active Airport</Label>
                </div>
              </div>
            )}

            {modalType === 'payment' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      defaultValue={selectedItem?.amount || ''} 
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select defaultValue={selectedItem?.currency || 'USD'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select defaultValue={selectedItem?.paymentMethod || 'credit_card'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue={selectedItem?.status || 'pending'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Here you would collect form data and call handleSave
                const formData = {
                  // Collect form data based on modalType
                };
                handleSave(formData);
              }}>
                {selectedItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
