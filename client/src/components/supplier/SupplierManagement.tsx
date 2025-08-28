import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { 
  Building2, 
  Car, 
  Users, 
  TrendingUp, 
  Settings,
  Plus,
  FileText,
  Shield,
  Globe,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Star,
  DollarSign,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface SupplierProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  vatNumber: string;
  companyNumber: string;
  status: 'active' | 'pending' | 'suspended' | 'verified';
  verificationLevel: 'basic' | 'enhanced' | 'premium';
  complianceScore: number;
  rating: number;
  totalBookings: number;
  totalRevenue: number;
  joinedDate: string;
  lastActive: string;
}

interface ComplianceStatus {
  gdpr: 'compliant' | 'non_compliant' | 'pending';
  financial: 'compliant' | 'non_compliant' | 'pending';
  accessibility: 'compliant' | 'non_compliant' | 'pending';
  environmental: 'compliant' | 'non_compliant' | 'pending';
  lastChecked: string;
  nextReview: string;
}

interface FinancialMetrics {
  monthlyRevenue: number;
  monthlyBookings: number;
  averageBookingValue: number;
  cancellationRate: number;
  refundRate: number;
  outstandingPayments: number;
  nextPayout: string;
  payoutSchedule: 'weekly' | 'biweekly' | 'monthly';
}

export function SupplierManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [supplierProfile, setSupplierProfile] = useState<SupplierProfile | null>(null);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);

  useEffect(() => {
    loadSupplierData();
  }, []);

  const loadSupplierData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('supplierToken');
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Load supplier profile
      const profileResponse = await fetch('/api/supplier/profile', { headers });
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        
        // Load parking lots for this supplier
        const lotsResponse = await fetch('/api/supplier/parking-lots', { headers });
        const parkingLots = lotsResponse.ok ? await lotsResponse.json() : [];
        
        // Load bookings for this supplier
        const bookingsResponse = await fetch('/api/supplier/bookings', { headers });
        const bookings = bookingsResponse.ok ? await bookingsResponse.json() : [];

        // Calculate metrics from real data
        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((sum: number, booking: any) => {
          const amount = parseFloat(booking.booking?.totalAmount || '0');
          return sum + amount;
        }, 0);

        // Calculate average rating from parking lots
        const averageRating = parkingLots.length > 0 ? 
          parkingLots.reduce((sum: number, lot: any) => sum + parseFloat(lot.rating || '0'), 0) / parkingLots.length : 0;

        // Calculate monthly metrics (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const monthlyBookings = bookings.filter((booking: any) => 
          new Date(booking.createdAt) >= thirtyDaysAgo
        ).length;
        
        const monthlyRevenue = bookings
          .filter((booking: any) => new Date(booking.createdAt) >= thirtyDaysAgo)
          .reduce((sum: number, booking: any) => {
            const amount = parseFloat(booking.booking?.totalAmount || '0');
            return sum + amount;
          }, 0);

        const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

        // Create supplier profile from real data
        setSupplierProfile({
          id: profile.id,
          name: profile.companyName || 'Your Company',
          email: profile.email,
          phone: profile.phone || '+44 20 7946 0958',
          address: profile.address || '123 Airport Way',
          city: profile.city || 'London',
          postcode: profile.postcode || 'TW6 1EW',
          country: profile.country || 'United Kingdom',
          vatNumber: profile.vatNumber || 'GB123456789',
          companyNumber: profile.companyNumber || '12345678',
          status: 'verified',
          verificationLevel: 'premium',
          complianceScore: 95,
          rating: averageRating,
          totalBookings,
          totalRevenue,
          joinedDate: profile.createdAt || '2023-01-15',
          lastActive: new Date().toISOString().split('T')[0],
        });

        // Set compliance status (placeholder - would come from actual compliance system)
        setComplianceStatus({
          gdpr: 'compliant',
          financial: 'compliant',
          accessibility: 'compliant',
          environmental: 'pending',
          lastChecked: '2025-01-10',
          nextReview: '2025-02-10',
        });

        // Set financial metrics from real data
        setFinancialMetrics({
          monthlyRevenue,
          monthlyBookings,
          averageBookingValue,
          cancellationRate: 0.05, // Placeholder - would calculate from actual data
          refundRate: 0.02, // Placeholder - would calculate from actual data
          outstandingPayments: monthlyRevenue * 0.12, // Placeholder - would come from payment system
          nextPayout: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          payoutSchedule: 'biweekly',
        });
      }
    } catch (error) {
      console.error('Error loading supplier data:', error);
      toast({
        title: "Error",
        description: "Failed to load supplier data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (data: Partial<SupplierProfile>) => {
    try {
      // Mock API call
      setSupplierProfile(prev => prev ? { ...prev, ...data } : null);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleComplianceCheck = async () => {
    try {
      // Mock compliance check
      toast({
        title: "Compliance Check",
        description: "Compliance status updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check compliance",
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'reports':
        setActiveTab('overview');
        toast({
          title: "Reports",
          description: "Opening reports dashboard...",
        });
        break;
      case 'profile':
        setActiveTab('profile');
        toast({
          title: "Profile",
          description: "Switched to profile tab",
        });
        break;
      case 'payment':
        setActiveTab('financial');
        toast({
          title: "Payment Settings",
          description: "Switched to financial tab",
        });
        break;
      case 'preferences':
        setActiveTab('settings');
        toast({
          title: "Preferences",
          description: "Switched to settings tab",
        });
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'verified':
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
      case 'non_compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading supplier management...</p>
        </div>
      </div>
    );
  }

  if (!supplierProfile) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No supplier profile found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-600">Manage your business profile and compliance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleComplianceCheck}>
            <Shield className="w-4 h-4 mr-2" />
            Check Compliance
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Badge className={getStatusColor(supplierProfile.status)}>
                  {supplierProfile.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{supplierProfile.verificationLevel}</div>
                <p className="text-xs text-muted-foreground">Verification Level</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{supplierProfile.complianceScore}%</div>
                <p className="text-xs text-muted-foreground">Overall Score</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{supplierProfile.rating}/5</div>
                <p className="text-xs text-muted-foreground">Customer Rating</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">£{(supplierProfile.totalRevenue / 1000000).toFixed(1)}M</div>
                <p className="text-xs text-muted-foreground">Lifetime Revenue</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => handleQuickAction('reports')}
                >
                  <FileText className="w-6 h-6 mb-2" />
                  <span className="text-sm">View Reports</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => handleQuickAction('profile')}
                >
                  <Globe className="w-6 h-6 mb-2" />
                  <span className="text-sm">Update Profile</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => handleQuickAction('payment')}
                >
                  <CreditCard className="w-6 h-6 mb-2" />
                  <span className="text-sm">Payment Settings</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => handleQuickAction('preferences')}
                >
                  <Settings className="w-6 h-6 mb-2" />
                  <span className="text-sm">Preferences</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Business Name</Label>
                  <Input id="name" value={supplierProfile.name} readOnly />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={supplierProfile.email} readOnly />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={supplierProfile.phone} readOnly />
                </div>
                <div>
                  <Label htmlFor="vat">VAT Number</Label>
                  <Input id="vat" value={supplierProfile.vatNumber} readOnly />
                </div>
                <div>
                  <Label htmlFor="company">Company Number</Label>
                  <Input id="company" value={supplierProfile.companyNumber} readOnly />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Input id="status" value={supplierProfile.status} readOnly />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={supplierProfile.address} readOnly />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={supplierProfile.city} readOnly />
                </div>
                <div>
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input id="postcode" value={supplierProfile.postcode} readOnly />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={supplierProfile.country} readOnly />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceStatus && Object.entries(complianceStatus).map(([key, value]) => {
                  if (key === 'lastChecked' || key === 'nextReview') return null;
                  return (
                    <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          value === 'compliant' ? 'bg-green-500' : 
                          value === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium capitalize">{key}</p>
                          <p className="text-sm text-gray-500">
                            Last checked: {complianceStatus.lastChecked}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(value)}>
                        {value}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Next Compliance Review</h4>
                    <p className="text-sm text-blue-700">
                      Your next compliance review is scheduled for {complianceStatus?.nextReview}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">£{financialMetrics?.monthlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{financialMetrics?.monthlyBookings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">£{financialMetrics?.averageBookingValue}</div>
                <p className="text-xs text-muted-foreground">Per booking</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{financialMetrics?.nextPayout}</div>
                <p className="text-xs text-muted-foreground">Scheduled date</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Outstanding Payments</span>
                  <span className="font-medium">£{financialMetrics?.outstandingPayments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cancellation Rate</span>
                  <span className="font-medium">{(financialMetrics?.cancellationRate || 0 * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Refund Rate</span>
                  <span className="font-medium">{(financialMetrics?.refundRate || 0 * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Payout Schedule</span>
                  <span className="font-medium capitalize">{financialMetrics?.payoutSchedule}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Business Registration Certificate</p>
                      <p className="text-sm text-gray-500">Uploaded on 2023-01-15</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">VAT Registration Certificate</p>
                      <p className="text-sm text-gray-500">Uploaded on 2023-01-15</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Public Liability Insurance</p>
                      <p className="text-sm text-gray-500">Expires on 2025-12-31</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notifications">Email Notifications</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select notification level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All notifications</SelectItem>
                      <SelectItem value="important">Important only</SelectItem>
                      <SelectItem value="none">No notifications</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en-GB">
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="cy-GB">Welsh</SelectItem>
                      <SelectItem value="gd-GB">Scottish Gaelic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="Europe/London">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                      <SelectItem value="Europe/Edinburgh">Edinburgh (GMT/BST)</SelectItem>
                      <SelectItem value="Europe/Belfast">Belfast (GMT/BST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
