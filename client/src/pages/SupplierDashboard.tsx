import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AddParkingLotDialog from "@/components/AddParkingLotDialog";
import BulkCreateSlotsDialog from "@/components/BulkCreateSlotsDialog";
import SupplierSlotManager from "@/components/SupplierSlotManager";
import { SupplierAnalytics } from '@/components/analytics/SupplierAnalytics';
import { SupplierManagement } from '@/components/supplier/SupplierManagement';
import {
  Building2,
  Calendar,
  Car,
  Users,
  TrendingUp,
  Settings,
  Plus,
  LogOut,
  User,
  BarChart3,
  Shield,
  Edit,
  X,
  DollarSign,
  Star,
  MapPin,
  FileText,
  Phone,
  Mail
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SupplierUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  supplierId: string;
}

interface ParkingLot {
  id: string;
  name: string;
  address: string;
  totalSpaces: number;
  isActive: boolean;
  description?: string;
  airportId?: string;
  distanceToTerminal?: string;
  shuttleFrequencyMinutes?: number;
  isShuttleIncluded?: boolean;
  isCovered?: boolean;
  hasEvCharging?: boolean;
  hasCarWash?: boolean;
  hasSecurityPatrol?: boolean;
  hasCctv?: boolean;
  rating?: string;
}

interface ParkingSlot {
  id: string;
  date: string;
  totalSpaces: number;
  availableSpaces: number;
  pricePerDay: string;
  currency: string;
}

interface SupplierBooking {
  id: string;
  bookingId: string;
  status: string;
  notes: string;
  createdAt: string;
  booking?: {
    id: string;
    startDate: string;
    endDate: string;
    totalAmount: string;
    vehicleInfo?: any;
    specialRequests?: string;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
    parkingLot?: {
      id: string;
      name: string;
      address: string;
      airportCode: string;
      airportName: string;
    };
  };
}

interface SupplierMetrics {
  totalParkingLots: number;
  totalSpaces: number;
  activeBookings: number;
  totalRevenue: number;
  averageRating: number;
  occupancyRate: number;
  monthlyBookings: number;
  monthlyRevenue: number;
}

export default function SupplierDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [supplierUser, setSupplierUser] = useState<SupplierUser | null>(null);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [bookings, setBookings] = useState<SupplierBooking[]>([]);
  const [metrics, setMetrics] = useState<SupplierMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingLot, setEditingLot] = useState<ParkingLot | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLotForSlots, setSelectedLotForSlots] = useState<ParkingLot | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<SupplierBooking | null>(null);
  const [isBookingDetailsModalOpen, setIsBookingDetailsModalOpen] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('supplierUser');
    if (!user) {
      setLocation('/supplier/login');
      return;
    }

    setSupplierUser(JSON.parse(user));
    loadDashboardData();
  }, [setLocation]);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('supplierToken');
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Load parking lots
      const lotsResponse = await fetch('/api/supplier/parking-lots', { headers });
      if (lotsResponse.ok) {
        const lots = await lotsResponse.json();
        console.log('🔍 Dashboard loaded parking lots:', lots);
        setParkingLots(lots);
      }

      // Load bookings
      const bookingsResponse = await fetch('/api/supplier/bookings', { headers });
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
      }

      // Load recent slots (last 7 days)
      if (parkingLots.length > 0) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const slotsResponse = await fetch(
          `/api/supplier/slots/${parkingLots[0].id}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
          { headers }
        );
        if (slotsResponse.ok) {
          const slots = await slotsResponse.json();
          setParkingSlots(slots);
        }
      }

      // Calculate metrics from real data
      calculateMetrics();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = () => {
    if (parkingLots.length === 0) return;

    const totalSpaces = parkingLots.reduce((sum, lot) => sum + (lot.totalSpaces || 0), 0);
    const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
    const totalRevenue = bookings.reduce((sum, booking) => {
      const amount = parseFloat(booking.booking?.totalAmount || '0');
      return sum + amount;
    }, 0);
    
    const averageRating = parkingLots.reduce((sum, lot) => {
      const rating = parseFloat(lot.rating || '0');
      return sum + rating;
    }, 0) / parkingLots.length;

    // Calculate occupancy rate based on available slots vs total spaces
    const totalAvailableSpaces = parkingSlots.reduce((sum, slot) => sum + slot.availableSpaces, 0);
    const occupancyRate = totalSpaces > 0 ? (totalSpaces - totalAvailableSpaces) / totalSpaces : 0;

    // Calculate monthly metrics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyBookings = bookings.filter(booking => 
      new Date(booking.createdAt) >= thirtyDaysAgo
    ).length;
    
    const monthlyRevenue = bookings
      .filter(booking => new Date(booking.createdAt) >= thirtyDaysAgo)
      .reduce((sum, booking) => {
        const amount = parseFloat(booking.booking?.totalAmount || '0');
        return sum + amount;
      }, 0);

    setMetrics({
      totalParkingLots: parkingLots.length,
      totalSpaces,
      activeBookings,
      totalRevenue,
      averageRating: isNaN(averageRating) ? 0 : averageRating,
      occupancyRate,
      monthlyBookings,
      monthlyRevenue
    });
  };

  // Recalculate metrics when data changes
  useEffect(() => {
    if (parkingLots.length > 0 && bookings.length > 0) {
      calculateMetrics();
    }
  }, [parkingLots, bookings, parkingSlots]);

  const handleLogout = () => {
    localStorage.removeItem('supplierToken');
    localStorage.removeItem('supplierUser');
    setLocation('/supplier/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditParkingLot = (lot: ParkingLot) => {
    setEditingLot(lot);
    setIsEditModalOpen(true);
  };

  const handleManageSlots = (lot: ParkingLot) => {
    setSelectedLotForSlots(lot);
    setActiveTab('slots');
    // Scroll to top to show slots management
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleParkingLotUpdate = async (updatedLot: ParkingLot) => {
    try {
      const token = localStorage.getItem('supplierToken');
      if (!token) return;

      const response = await fetch(`/api/supplier/parking-lots/${updatedLot.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedLot),
      });

      if (response.ok) {
        setParkingLots(prev => prev.map(lot => 
          lot.id === updatedLot.id ? updatedLot : lot
        ));
        setIsEditModalOpen(false);
        setEditingLot(null);
        toast({
          title: "Success",
          description: "Parking lot updated successfully",
        });
      } else {
        throw new Error('Failed to update parking lot');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update parking lot",
        variant: "destructive",
      });
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingLot(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleViewBookingDetails = (booking: SupplierBooking) => {
    setSelectedBooking(booking);
    setIsBookingDetailsModalOpen(true);
  };

  const handleCloseBookingDetailsModal = () => {
    setIsBookingDetailsModalOpen(false);
    setSelectedBooking(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Supplier Dashboard</h1>
                <p className="text-sm text-gray-500">
                  Welcome back, {supplierUser?.firstName} {supplierUser?.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Parking Lots</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalParkingLots || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active parking facilities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spaces</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalSpaces || 0}</div>
              <p className="text-xs text-muted-foreground">
                Available parking spaces
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.activeBookings || 0}</div>
              <p className="text-xs text-muted-foreground">
                Confirmed reservations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics?.monthlyRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="parking-lots">Parking Lots</TabsTrigger>
            <TabsTrigger value="slots">Slots</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest customer reservations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {booking.booking?.user ? 
                              `${booking.booking.user.firstName} ${booking.booking.user.lastName}` : 
                              `Booking #${booking.bookingId?.slice(-8) || 'Unknown'}`
                            }
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                          {booking.booking?.parkingLot && (
                            <p className="text-sm text-blue-600">
                              {booking.booking.parkingLot.airportCode} - {booking.booking.parkingLot.name}
                            </p>
                          )}
                          {booking.booking?.totalAmount && (
                            <p className="text-sm text-green-600 font-medium">
                              {formatCurrency(parseFloat(booking.booking.totalAmount))}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                    {bookings.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No bookings found</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Parking Lots Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Parking Lots Status</CardTitle>
                  <CardDescription>Current facility status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {parkingLots.map((lot) => (
                      <div key={lot.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{lot.name}</p>
                          <p className="text-sm text-gray-500">{lot.address}</p>
                          {lot.rating && (
                            <div className="flex items-center mt-1">
                              <Star className="w-3 h-3 text-yellow-500 mr-1" />
                              <span className="text-xs text-gray-600">{lot.rating}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{lot.totalSpaces} spaces</p>
                          <Badge variant={lot.isActive ? "default" : "secondary"}>
                            {lot.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {parkingLots.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No parking lots found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Occupancy Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {((metrics?.occupancyRate || 0) * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-500">
                    Current parking utilization
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Average Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {metrics?.averageRating?.toFixed(1) || '0.0'}
                  </div>
                  <p className="text-sm text-gray-500">
                    Customer satisfaction score
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(metrics?.totalRevenue || 0)}
                  </div>
                  <p className="text-sm text-gray-500">
                    Lifetime earnings
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="parking-lots" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Parking Lots Management</h2>
              <AddParkingLotDialog onParkingLotAdded={loadDashboardData} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parkingLots.map((lot) => (
                <Card key={lot.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {lot.name}
                      <Badge variant={lot.isActive ? "default" : "secondary"}>
                        {lot.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{lot.address}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total Spaces:</span>
                        <span className="font-medium">{lot.totalSpaces}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditParkingLot(lot)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleManageSlots(lot)}
                        >
                          Manage Slots
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Edit Parking Lot Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    Edit Parking Lot: {editingLot?.name}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleCloseEditModal}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </DialogTitle>
                  <DialogDescription>
                    Update the parking lot information below
                  </DialogDescription>
                </DialogHeader>
                
                {editingLot && (
                  <form onSubmit={(e) => { e.preventDefault(); handleParkingLotUpdate(editingLot); }} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Parking Lot Name *</Label>
                          <Input 
                            id="edit-name" 
                            value={editingLot.name} 
                            onChange={(e) => setEditingLot(prev => prev ? {...prev, name: e.target.value} : null)}
                            placeholder="e.g., Premium Airport Parking"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-totalSpaces">Total Spaces *</Label>
                          <Input 
                            id="edit-totalSpaces" 
                            type="number"
                            value={editingLot.totalSpaces} 
                            onChange={(e) => setEditingLot(prev => prev ? {...prev, totalSpaces: parseInt(e.target.value)} : null)}
                            min="1"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Input 
                          id="edit-description" 
                          value={editingLot.description || ''} 
                          onChange={(e) => setEditingLot(prev => prev ? {...prev, description: e.target.value} : null)}
                          placeholder="Brief description of the parking lot"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-address">Address *</Label>
                        <Input 
                          id="edit-address" 
                          value={editingLot.address} 
                          onChange={(e) => setEditingLot(prev => prev ? {...prev, address: e.target.value} : null)}
                          placeholder="Full address of the parking lot"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-airport">Airport *</Label>
                        <Input 
                          id="edit-airport" 
                          value={editingLot.airportId || 'Airport ID'} 
                          readOnly
                          className="bg-gray-100"
                        />
                      </div>
                    </div>

                    {/* Location & Distance */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Location & Distance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-distanceToTerminal">Distance to Terminal (miles)</Label>
                          <Input
                            id="edit-distanceToTerminal"
                            type="number"
                            step="0.1"
                            value={editingLot.distanceToTerminal || 1.0}
                            onChange={(e) => setEditingLot(prev => prev ? {...prev, distanceToTerminal: e.target.value} : null)}
                            min="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-shuttleFrequencyMinutes">Shuttle Frequency (minutes)</Label>
                          <Input
                            id="edit-shuttleFrequencyMinutes"
                            type="number"
                            value={editingLot.shuttleFrequencyMinutes || 15}
                            onChange={(e) => setEditingLot(prev => prev ? {...prev, shuttleFrequencyMinutes: parseInt(e.target.value)} : null)}
                            min="5"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Amenities & Services</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="edit-isShuttleIncluded"
                            checked={editingLot.isShuttleIncluded || false}
                            onChange={(e) => setEditingLot(prev => prev ? {...prev, isShuttleIncluded: e.target.checked} : null)}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="edit-isShuttleIncluded">Shuttle Service</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="edit-isCovered"
                            checked={editingLot.isCovered || false}
                            onChange={(e) => setEditingLot(prev => prev ? {...prev, isCovered: e.target.checked} : null)}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="edit-isCovered">Covered Parking</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="edit-hasEvCharging"
                            checked={editingLot.hasEvCharging || false}
                            onChange={(e) => setEditingLot(prev => prev ? {...prev, hasEvCharging: e.target.checked} : null)}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="edit-hasEvCharging">EV Charging</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="edit-hasCarWash"
                            checked={editingLot.hasCarWash || false}
                            onChange={(e) => setEditingLot(prev => prev ? {...prev, hasCarWash: e.target.checked} : null)}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="edit-hasCarWash">Car Wash</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="edit-hasSecurityPatrol"
                            checked={editingLot.hasSecurityPatrol || false}
                            onChange={(e) => setEditingLot(prev => prev ? {...prev, hasSecurityPatrol: e.target.checked} : null)}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="edit-hasSecurityPatrol">Security Patrol</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="edit-hasCctv"
                            checked={editingLot.hasCctv || false}
                            onChange={(e) => setEditingLot(prev => prev ? {...prev, hasCctv: e.target.checked} : null)}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="edit-hasCctv">CCTV Surveillance</Label>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Status & Configuration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-isActive">Status</Label>
                          <Select 
                            value={editingLot.isActive ? "active" : "inactive"}
                            onValueChange={(value) => setEditingLot(prev => prev ? {...prev, isActive: value === "active"} : null)}
                            >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-rating">Rating</Label>
                          <Input
                            id="edit-rating"
                            type="number"
                            step="0.1"
                            value={editingLot.rating || 0}
                            onChange={(e) => setEditingLot(prev => prev ? {...prev, rating: e.target.value} : null)}
                            min="0"
                            max="5"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={handleCloseEditModal}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="slots" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Parking Slots Management</h2>
              <BulkCreateSlotsDialog onSlotsCreated={loadDashboardData} />
            </div>
            
            {/* Show selected parking lot info */}
            {selectedLotForSlots && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-900">
                    Managing Slots for: {selectedLotForSlots.name}
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    {selectedLotForSlots.address} • {selectedLotForSlots.totalSpaces} total spaces
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
            
            <SupplierSlotManager 
              parkingLots={parkingLots} 
              onSlotsUpdated={loadDashboardData}
              selectedLotId={selectedLotForSlots?.id}
            />
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Bookings Management</h2>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>Manage customer reservations for your parking lots</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">
                              {booking.booking?.user ? 
                                `${booking.booking.user.firstName} ${booking.booking.user.lastName}` : 
                                `Booking #${booking.bookingId?.slice(-8) || 'Unknown'}`
                              }
                            </p>
                            <p className="text-sm text-gray-500">
                              Created: {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                            {booking.booking && (
                              <>
                                <p className="text-sm text-gray-600 mt-1">
                                  {new Date(booking.booking.startDate).toLocaleDateString()} - {new Date(booking.booking.endDate).toLocaleDateString()}
                                </p>
                                {booking.booking.parkingLot && (
                                  <div className="mt-2 space-y-1">
                                    <p className="text-sm font-medium text-blue-600">
                                      {booking.booking.parkingLot.airportCode} - {booking.booking.parkingLot.airportName}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {booking.booking.parkingLot.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {booking.booking.parkingLot.address}
                                    </p>
                                  </div>
                                )}
                                {booking.booking.vehicleInfo && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {booking.booking.vehicleInfo.make} {booking.booking.vehicleInfo.model} ({booking.booking.vehicleInfo.color})
                                  </p>
                                )}
                                {booking.booking.specialRequests && (
                                  <p className="text-sm text-blue-600 mt-1">
                                    Special: {booking.booking.specialRequests}
                                  </p>
                                )}
                              </>
                            )}
                            {booking.notes && (
                              <p className="text-sm text-gray-600 mt-1">{booking.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {booking.booking?.totalAmount && (
                          <div className="text-right">
                            <p className="font-medium text-green-600">
                              {formatCurrency(parseFloat(booking.booking.totalAmount))}
                            </p>
                          </div>
                        )}
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => handleViewBookingDetails(booking)}>View Details</Button>
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No bookings found for your parking lots</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Bookings will appear here when customers reserve spaces at your parking facilities
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Performance Analytics</h2>
              <p className="text-gray-600">Track your business performance and insights</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Supplier Performance Dashboard
                </CardTitle>
                <CardDescription>
                  Monitor your parking lot performance, revenue trends, and customer satisfaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SupplierAnalytics 
                  className="w-full" 
                  supplierId={supplierUser?.supplierId}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <SupplierManagement />
          </TabsContent>
        </Tabs>
      </main>

      {/* Booking Details Modal */}
      <Dialog open={isBookingDetailsModalOpen} onOpenChange={setIsBookingDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Booking Details: {selectedBooking?.bookingId}
              <Button variant="ghost" size="sm" onClick={handleCloseBookingDetailsModal}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Detailed information about the booking.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Booking ID:</p>
                  <p className="text-gray-700">{selectedBooking.bookingId}</p>
                </div>
                <div>
                  <p className="font-medium">Status:</p>
                  <Badge className={getStatusColor(selectedBooking.status)}>{selectedBooking.status}</Badge>
                </div>
                <div>
                  <p className="font-medium">Created At:</p>
                  <p className="text-gray-700">{new Date(selectedBooking.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium">Notes:</p>
                  <p className="text-gray-700">{selectedBooking.notes}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Customer:</p>
                  <p className="text-gray-700">
                    {selectedBooking.booking?.user ? 
                      `${selectedBooking.booking.user.firstName} ${selectedBooking.booking.user.lastName}` : 
                      'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="font-medium">Contact:</p>
                  <p className="text-gray-700">
                    <Phone className="w-4 h-4 inline-block mr-1" />
                    {selectedBooking.booking?.user?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Parking Lot:</p>
                  <p className="text-gray-700">
                    {selectedBooking.booking?.parkingLot ? 
                      `${selectedBooking.booking.parkingLot.airportCode} - ${selectedBooking.booking.parkingLot.name}` : 
                      'N/A'
                    }
                  </p>
                </div>
                                 <div>
                   <p className="font-medium">Dates:</p>
                   <p className="text-gray-700">
                     {selectedBooking.booking ? 
                       `${new Date(selectedBooking.booking.startDate).toLocaleDateString()} - ${new Date(selectedBooking.booking.endDate).toLocaleDateString()}` : 
                       'N/A'
                     }
                   </p>
                 </div>
                <div>
                  <p className="font-medium">Vehicle:</p>
                  <p className="text-gray-700">
                    {selectedBooking.booking?.vehicleInfo ? 
                      `${selectedBooking.booking.vehicleInfo.make} ${selectedBooking.booking.vehicleInfo.model} (${selectedBooking.booking.vehicleInfo.color})` : 
                      'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="font-medium">Special Requests:</p>
                  <p className="text-gray-700">
                    {selectedBooking.booking?.specialRequests || 'None'}
                  </p>
                </div>
                                 <div>
                   <p className="font-medium">Total Amount:</p>
                   <p className="text-green-600 font-bold text-lg">
                     <DollarSign className="w-4 h-4 inline-block mr-1" />
                     {selectedBooking.booking?.totalAmount ? 
                       formatCurrency(parseFloat(selectedBooking.booking.totalAmount)) : 
                       'N/A'
                     }
                   </p>
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 