import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Star, 
  MapPin, 
  Clock, 
  Filter,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  CheckCircle,
  XCircle,
  Car,
  Users,
  ShoppingCart,
  Repeat,
  AlertTriangle,
  TrendingDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie, AreaChart, Area } from 'recharts';

interface SupplierMetrics {
  totalParkingLots: number;
  totalSpaces: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  occupancyRate: number;
  customerSatisfactionScore: number;
  onTimePerformance: number;
  qualityScore: number;
}

interface SupplierPerformance {
  lotId: string;
  lotName: string;
  location: string;
  totalBookings: number;
  revenue: number;
  rating: number;
  occupancyRate: number;
  customerSatisfaction: number;
  onTimePerformance: number;
  qualityScore: number;
  growthRate: number;
  status: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
}

interface RevenueTrend {
  date: string;
  revenue: number;
  bookings: number;
  averagePrice: number;
  lotCount: number;
}

interface GeographicPerformance {
  region: string;
  lots: number;
  revenue: number;
  bookings: number;
  averageRating: number;
  growth: number;
}

interface OperationalMetrics {
  category: string;
  metric: string;
  value: number;
  target: number;
  status: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface SupplierAnalyticsProps {
  className?: string;
  supplierId?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const STATUS_COLORS = {
  excellent: 'bg-green-100 text-green-800',
  good: 'bg-blue-100 text-blue-800',
  average: 'bg-yellow-100 text-yellow-800',
  poor: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

export function SupplierAnalytics({ className = '', supplierId }: SupplierAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{
    metrics: SupplierMetrics;
    performance: SupplierPerformance[];
    trends: RevenueTrend[];
    geography: GeographicPerformance[];
    operations: OperationalMetrics[];
  } | null>(null);

  useEffect(() => {
    if (supplierId) {
      loadAnalyticsData();
    }
  }, [timeRange, supplierId]);

  const loadAnalyticsData = async () => {
    if (!supplierId) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('supplierToken');
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Load analytics data from the new API endpoint
      const analyticsResponse = await fetch(`/api/supplier/analytics?timeRange=${timeRange}`, { headers });
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setData(analyticsData);
      } else {
        throw new Error('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Fallback to local calculation if API fails
      loadAnalyticsDataFallback();
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalyticsDataFallback = async () => {
    try {
      const token = localStorage.getItem('supplierToken');
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Load parking lots for this supplier
      const lotsResponse = await fetch('/api/supplier/parking-lots', { headers });
      const parkingLots = lotsResponse.ok ? await lotsResponse.json() : [];
      
      // Load bookings for this supplier
      const bookingsResponse = await fetch('/api/supplier/bookings', { headers });
      const bookings = bookingsResponse.ok ? await bookingsResponse.json() : [];

      // Calculate metrics from real data
      const metrics = calculateMetrics(parkingLots, bookings);
      const performance = calculatePerformance(parkingLots, bookings);
      const trends = calculateTrends(bookings, timeRange);
      const geography = calculateGeography(parkingLots, bookings);
      const operations = calculateOperations(metrics);

      setData({
        metrics,
        performance,
        trends,
        geography,
        operations
      });
    } catch (error) {
      console.error('Error loading fallback analytics data:', error);
    }
  };

  const calculateMetrics = (parkingLots: any[], bookings: any[]): SupplierMetrics => {
    const totalSpaces = parkingLots.reduce((sum, lot) => sum + (lot.totalSpaces || 0), 0);
    const totalRevenue = bookings.reduce((sum, booking) => {
      const amount = parseFloat(booking.booking?.totalAmount || '0');
      return sum + amount;
    }, 0);
    
    const averageRating = parkingLots.length > 0 ? 
      parkingLots.reduce((sum, lot) => sum + parseFloat(lot.rating || '0'), 0) / parkingLots.length : 0;

    // Calculate occupancy rate (simplified - in real app you'd get this from slots)
    const occupancyRate = 0.75; // Placeholder - would calculate from actual slot data

    return {
      totalParkingLots: parkingLots.length,
      totalSpaces,
      totalBookings: bookings.length,
      totalRevenue,
      averageRating: isNaN(averageRating) ? 0 : averageRating,
      occupancyRate,
      customerSatisfactionScore: averageRating * 2, // Convert 5-star to 10-point scale
      onTimePerformance: 0.94, // Placeholder - would calculate from actual data
      qualityScore: averageRating * 2 // Convert 5-star to 10-point scale
    };
  };

  const calculatePerformance = (parkingLots: any[], bookings: any[]): SupplierPerformance[] => {
    return parkingLots.map(lot => {
      const lotBookings = bookings.filter(booking => 
        booking.booking?.lotId === lot.id
      );
      
      const lotRevenue = lotBookings.reduce((sum, booking) => {
        const amount = parseFloat(booking.booking?.totalAmount || '0');
        return sum + amount;
      }, 0);

      const rating = parseFloat(lot.rating || '0');
      const status = rating >= 4.5 ? 'excellent' : 
                    rating >= 4.0 ? 'good' : 
                    rating >= 3.5 ? 'average' : 
                    rating >= 3.0 ? 'poor' : 'critical';

      return {
        lotId: lot.id,
        lotName: lot.name,
        location: lot.address,
        totalBookings: lotBookings.length,
        revenue: lotRevenue,
        rating,
        occupancyRate: 0.8, // Placeholder
        customerSatisfaction: rating * 2,
        onTimePerformance: 0.95, // Placeholder
        qualityScore: rating * 2,
        growthRate: 12.5, // Placeholder - would calculate from historical data
        status
      };
    });
  };

  const calculateTrends = (bookings: any[], timeRange: string): RevenueTrend[] => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      
      // Filter bookings for this date
      const dayBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate.toDateString() === date.toDateString();
      });

      const dayRevenue = dayBookings.reduce((sum, booking) => {
        const amount = parseFloat(booking.booking?.totalAmount || '0');
        return sum + amount;
      }, 0);

      const averagePrice = dayBookings.length > 0 ? 
        dayBookings.reduce((sum, booking) => {
          const amount = parseFloat(booking.booking?.totalAmount || '0');
          return sum + amount;
        }, 0) / dayBookings.length : 0;

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
        bookings: dayBookings.length,
        averagePrice,
        lotCount: 1 // This supplier's lots
      };
    });
  };

  const calculateGeography = (parkingLots: any[], bookings: any[]): GeographicPerformance[] => {
    // Group by airport/city
    const regions = new Map<string, any>();
    
    parkingLots.forEach(lot => {
      const region = lot.airportId || 'Unknown';
      if (!regions.has(region)) {
        regions.set(region, {
          region,
          lots: 0,
          revenue: 0,
          bookings: 0,
          totalRating: 0,
          count: 0
        });
      }
      
      const regionData = regions.get(region);
      regionData.lots++;
      regionData.count++;
      regionData.totalRating += parseFloat(lot.rating || '0');
    });

    // Add booking data
    bookings.forEach(booking => {
      // Find the lot for this booking
      const lot = parkingLots.find(l => l.id === booking.booking?.lotId);
      if (lot) {
        const region = lot.airportId || 'Unknown';
        if (regions.has(region)) {
          const regionData = regions.get(region);
          regionData.bookings++;
          regionData.revenue += parseFloat(booking.booking?.totalAmount || '0');
        }
      }
    });

    return Array.from(regions.values()).map(region => ({
      region: region.region,
      lots: region.lots,
      revenue: region.revenue,
      bookings: region.bookings,
      averageRating: region.count > 0 ? region.totalRating / region.count : 0,
      growth: 15.0 // Placeholder - would calculate from historical data
    }));
  };

  const calculateOperations = (metrics: SupplierMetrics): OperationalMetrics[] => {
    return [
      {
        category: 'Performance',
        metric: 'On-Time Performance',
        value: metrics.onTimePerformance * 100,
        target: 95,
        status: metrics.onTimePerformance >= 0.95 ? 'excellent' : 
                metrics.onTimePerformance >= 0.90 ? 'good' : 
                metrics.onTimePerformance >= 0.85 ? 'average' : 
                metrics.onTimePerformance >= 0.80 ? 'poor' : 'critical',
        trend: 'up'
      },
      {
        category: 'Quality',
        metric: 'Customer Satisfaction',
        value: metrics.customerSatisfactionScore,
        target: 9.0,
        status: metrics.customerSatisfactionScore >= 9.0 ? 'excellent' : 
                metrics.customerSatisfactionScore >= 8.0 ? 'good' : 
                metrics.customerSatisfactionScore >= 7.0 ? 'average' : 
                metrics.customerSatisfactionScore >= 6.0 ? 'poor' : 'critical',
        trend: 'up'
      },
      {
        category: 'Efficiency',
        metric: 'Occupancy Rate',
        value: metrics.occupancyRate * 100,
        target: 80,
        status: metrics.occupancyRate >= 0.80 ? 'excellent' : 
                metrics.occupancyRate >= 0.70 ? 'good' : 
                metrics.occupancyRate >= 0.60 ? 'average' : 
                metrics.occupancyRate >= 0.50 ? 'poor' : 'critical',
        trend: 'stable'
      },
      {
        category: 'Growth',
        metric: 'Revenue Growth',
        value: 12.5, // Placeholder - would calculate from historical data
        target: 15.0,
        status: 12.5 >= 15.0 ? 'excellent' : 
                12.5 >= 10.0 ? 'good' : 
                12.5 >= 5.0 ? 'average' : 
                12.5 >= 0.0 ? 'poor' : 'critical',
        trend: 'up'
      },
      {
        category: 'Retention',
        metric: 'Customer Retention',
        value: 85, // Placeholder - would calculate from actual data
        target: 90,
        status: 85 >= 90 ? 'excellent' : 
                85 >= 80 ? 'good' : 
                85 >= 70 ? 'average' : 
                85 >= 60 ? 'poor' : 'critical',
        trend: 'stable'
      }
    ];
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();
  const formatDecimal = (value: number) => value.toFixed(1);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'average': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'poor': return <XCircle className="h-4 w-4 text-orange-600" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Activity className="h-4 w-4 text-gray-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleExportData = (type: string) => {
    // Simulate data export
    const link = document.createElement('a');
    link.download = `supplier-analytics-${type}-${timeRange}.csv`;
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent('Sample data export');
    link.click();
  };

  if (isLoading || !data) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Your Analytics</h2>
          <p className="text-muted-foreground">
            Performance insights for your parking facilities
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExportData('summary')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parking Lots</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data?.metrics?.totalParkingLots ?? 0)}</div>
            <p className="text-xs text-muted-foreground">
              Active facilities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data?.metrics?.totalRevenue ?? 0)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(data?.metrics?.occupancyRate ?? 0)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(data?.metrics?.totalBookings ?? 0)} total bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDecimal(data?.metrics?.qualityScore ?? 0)}/10</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(data?.metrics?.onTimePerformance ?? 0)} on-time performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Supplier Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Performance Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Excellent', value: data.performance.filter(p => p.status === 'excellent').length },
                        { name: 'Good', value: data.performance.filter(p => p.status === 'good').length },
                        { name: 'Average', value: data.performance.filter(p => p.status === 'average').length },
                        { name: 'Poor', value: data.performance.filter(p => p.status === 'poor').length },
                        { name: 'Critical', value: data.performance.filter(p => p.status === 'critical').length }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Key Performance Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPercentage(data?.metrics?.occupancyRate ?? 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Occupancy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPercentage(data?.metrics?.onTimePerformance ?? 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">On-Time Performance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatDecimal(data?.metrics?.averageRating ?? 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {formatDecimal(data?.metrics?.customerSatisfactionScore ?? 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Satisfaction Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.performance.map((supplier, index) => (
                  <div key={supplier.lotId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{supplier.lotName}</div>
                        <div className="text-sm text-muted-foreground">
                          {supplier.location} • {formatNumber(supplier.totalBookings)} bookings
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(supplier.revenue)}</div>
                        <div className="text-sm text-muted-foreground">
                          +{supplier.growthRate}% growth
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatDecimal(supplier.rating)}★</div>
                        <div className="text-sm text-muted-foreground">
                          {formatPercentage(supplier.occupancyRate)} occupancy
                        </div>
                      </div>
                      <Badge className={STATUS_COLORS[supplier.status]}>
                        {supplier.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Bookings Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="bookings" fill="#3b82f6" name="Bookings" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.geography.map((region, index) => (
                  <div key={region.region} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{region.region}</div>
                        <div className="text-sm text-muted-foreground">
                          {region.lots} lots • {formatNumber(region.bookings)} bookings
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(region.revenue)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDecimal(region.averageRating)}★ • +{region.growth}% growth
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operational Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.operations.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(metric.status)}
                      <div>
                        <div className="font-medium">{metric.metric}</div>
                        <div className="text-sm text-muted-foreground">
                          Target: {metric.target}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{metric.value}</div>
                        <div className="text-sm text-muted-foreground">
                          {metric.value >= metric.target ? 'Target Met' : 'Below Target'}
                        </div>
                      </div>
                      <Badge className={STATUS_COLORS[metric.status]}>
                        {metric.status}
                      </Badge>
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-green-600">Positive Trends</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Supplier retention rate at 91%, exceeding target</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>On-time performance improved to 94%</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>New supplier onboarding increased by 18</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-orange-600">Areas for Improvement</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <span>Occupancy rate below target (78% vs 80%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <span>Revenue growth below target (12.5% vs 15%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <span>4 suppliers churned this period</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
