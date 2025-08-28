import React, { useState, useEffect } from 'react';
import { useSupplierAuth } from '../contexts/SupplierAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Building2, 
  Car, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  MapPin,
  Star,
  Clock,
  AlertCircle,
  Plus,
  Settings,
  BarChart3,
  FileText,
  Bell
} from 'lucide-react';
import ParkingLotManager from '../components/supplier/ParkingLotManager';

interface DashboardStats {
  totalLots: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  pendingBookings: number;
  activeLots: number;
}

interface RecentBooking {
  id: string;
  bookingReference: string;
  customerName: string;
  lotName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const SupplierDashboard: React.FC = () => {
  const { supplier, logout } = useSupplierAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalLots: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    pendingBookings: 0,
    activeLots: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch stats
      const statsResponse = await fetch('/api/supplier/analytics', {
        credentials: 'include',
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalLots: statsData.summary?.totalLots || 0,
          totalBookings: statsData.summary?.totalBookings || 0,
          totalRevenue: statsData.summary?.totalRevenue || 0,
          averageRating: statsData.summary?.averageRating || 0,
          pendingBookings: statsData.summary?.pendingBookings || 0,
          activeLots: statsData.summary?.activeLots || 0,
        });
      }

      // Fetch recent bookings
      const bookingsResponse = await fetch('/api/supplier/bookings?limit=5', {
        credentials: 'include',
      });
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setRecentBookings(bookingsData.bookings || []);
      }

      // Fetch notifications
      const notificationsResponse = await fetch('/api/supplier/notifications?unreadOnly=true', {
        credentials: 'include',
      });
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/supplier/login';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Supplier Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {supplier?.firstName} {supplier?.lastName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button className="bg-gray-100 hover:bg-gray-200">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                {notifications.length > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
              <Button className="bg-gray-100 hover:bg-gray-200" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Parking Lots</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLots}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeLots} active lots
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingBookings} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-green-600" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Based on customer reviews
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="parking-lots">Parking Lots</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Manage your parking facilities and bookings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button className="h-20 flex flex-col bg-blue-50 hover:bg-blue-100 border border-blue-200">
                        <Plus className="h-6 w-6 mb-2" />
                        Add Parking Lot
                      </Button>
                      <Button className="h-20 flex flex-col bg-green-50 hover:bg-green-100 border border-green-200">
                        <DollarSign className="h-6 w-6 mb-2" />
                        Manage Pricing
                      </Button>
                      <Button className="h-20 flex flex-col bg-purple-50 hover:bg-purple-100 border border-purple-200">
                        <Calendar className="h-6 w-6 mb-2" />
                        View Bookings
                      </Button>
                      <Button className="h-20 flex flex-col bg-orange-50 hover:bg-orange-100 border border-orange-200">
                        <BarChart3 className="h-6 w-6 mb-2" />
                        Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Bookings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>
                      Latest customer bookings for your parking lots
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentBookings.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No bookings yet</p>
                          <p className="text-sm">Bookings will appear here once customers start booking</p>
                        </div>
                      ) : (
                        recentBookings.map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Car className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{booking.customerName}</p>
                                <p className="text-sm text-gray-600">{booking.lotName}</p>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span>{new Date(booking.startDate).toLocaleDateString()}</span>
                                  <span>-</span>
                                  <span>{new Date(booking.endDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${booking.totalAmount}</p>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-4">
                      <Button className="w-full bg-gray-100 hover:bg-gray-200">
                        View All Bookings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No new notifications
                        </p>
                      ) : (
                        notifications.slice(0, 3).map((notification) => (
                          <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className="text-xs text-gray-600">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 3 && (
                      <Button className="w-full mt-3 bg-gray-100 hover:bg-gray-200">
                        View All Notifications
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Occupancy Rate</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Avg. Daily Revenue</span>
                        <span className="font-medium">$1,234</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Customer Satisfaction</span>
                        <span className="font-medium">4.5/5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Active Promotions</span>
                        <span className="font-medium">3</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Support */}
                <Card>
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start bg-gray-100 hover:bg-gray-200">
                        <FileText className="h-4 w-4 mr-2" />
                        Documentation
                      </Button>
                      <Button className="w-full justify-start bg-gray-100 hover:bg-gray-200">
                        <Settings className="h-4 w-4 mr-2" />
                        Account Settings
                      </Button>
                      <Button className="w-full justify-start bg-gray-100 hover:bg-gray-200">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Contact Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="parking-lots" className="space-y-6">
            <ParkingLotManager />
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>
                  View and manage all customer bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Bookings management coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Detailed analytics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SupplierDashboard; 