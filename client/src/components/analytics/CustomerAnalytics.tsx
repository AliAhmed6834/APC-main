import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Users, 
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
  UserCheck,
  UserX,
  ShoppingCart,
  Repeat
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

interface CustomerMetrics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  churnedCustomers: number;
  averageRating: number;
  totalBookings: number;
  averageBookingValue: number;
  customerLifetimeValue: number;
  repeatBookingRate: number;
  satisfactionScore: number;
}

interface CustomerSegment {
  segment: string;
  count: number;
  percentage: number;
  averageValue: number;
  growthRate: number;
}

interface BookingTrend {
  date: string;
  bookings: number;
  revenue: number;
  newCustomers: number;
  repeatCustomers: number;
}

interface GeographicData {
  region: string;
  customers: number;
  revenue: number;
  growth: number;
}

interface CustomerAnalyticsProps {
  className?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function CustomerAnalytics({ className = '' }: CustomerAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('bookings');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{
    metrics: CustomerMetrics;
    segments: CustomerSegment[];
    trends: BookingTrend[];
    geography: GeographicData[];
  } | null>(null);

  // Mock data for demonstration
  const mockData = useMemo(() => ({
    metrics: {
      totalCustomers: 15420,
      activeCustomers: 8920,
      newCustomers: 1240,
      churnedCustomers: 180,
      averageRating: 4.6,
      totalBookings: 45680,
      averageBookingValue: 89.50,
      customerLifetimeValue: 342.80,
      repeatBookingRate: 0.68,
      satisfactionScore: 8.7
    },
    segments: [
      { segment: 'Business Travelers', count: 4560, percentage: 29.6, averageValue: 156.80, growthRate: 12.5 },
      { segment: 'Leisure Travelers', count: 6230, percentage: 40.4, averageValue: 89.20, growthRate: 8.3 },
      { segment: 'Frequent Flyers', count: 2340, percentage: 15.2, averageValue: 234.60, growthRate: 15.7 },
      { segment: 'Occasional Users', count: 2290, percentage: 14.8, averageValue: 67.40, growthRate: 5.2 }
    ],
    trends: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bookings: Math.floor(Math.random() * 200) + 100,
        revenue: Math.floor(Math.random() * 15000) + 8000,
        newCustomers: Math.floor(Math.random() * 50) + 20,
        repeatCustomers: Math.floor(Math.random() * 150) + 80
      };
    }),
    geography: [
      { region: 'Los Angeles', customers: 3240, revenue: 289000, growth: 15.2 },
      { region: 'New York', customers: 2980, revenue: 267000, growth: 12.8 },
      { region: 'Chicago', customers: 2150, revenue: 189000, growth: 8.9 },
      { region: 'Miami', customers: 1890, revenue: 156000, growth: 22.1 },
      { region: 'Seattle', customers: 1670, revenue: 142000, growth: 18.7 },
      { region: 'Denver', customers: 1490, revenue: 128000, growth: 11.3 }
    ]
  }), []);

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setData(mockData);
      setIsLoading(false);
    }, 1000);
  }, [timeRange, mockData]);

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'customers': return <Users className="h-4 w-4" />;
      case 'revenue': return <DollarSign className="h-4 w-4" />;
      case 'bookings': return <ShoppingCart className="h-4 w-4" />;
      case 'satisfaction': return <Star className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'customers': return 'text-blue-600';
      case 'revenue': return 'text-green-600';
      case 'bookings': return 'text-purple-600';
      case 'satisfaction': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const handleExportData = (type: string) => {
    // Simulate data export
    const link = document.createElement('a');
    link.download = `customer-analytics-${type}-${timeRange}.csv`;
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
          <h2 className="text-3xl font-bold tracking-tight">Customer Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into customer behavior and business performance
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
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.metrics.totalCustomers)}</div>
            <p className="text-xs text-muted-foreground">
              +{data.metrics.newCustomers} new this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.metrics.activeCustomers)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(data.metrics.activeCustomers / data.metrics.totalCustomers)} of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer LTV</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.metrics.customerLifetimeValue)}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.satisfactionScore}/10</div>
            <p className="text-xs text-muted-foreground">
              {data.metrics.averageRating}★ average rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Customer Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="newCustomers" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="New Customers"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="repeatCustomers" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Repeat Customers"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Customer Segments Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Customer Segments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={data.segments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ segment, percentage }) => `${segment}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.segments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                    {formatPercentage(data.metrics.repeatBookingRate)}
                  </div>
                  <div className="text-sm text-muted-foreground">Repeat Booking Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(data.metrics.averageBookingValue)}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Booking Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatNumber(data.metrics.totalBookings)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {data.metrics.averageRating}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.segments.map((segment, index) => (
                  <div key={segment.segment} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <div className="font-medium">{segment.segment}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatNumber(segment.count)} customers ({segment.percentage}%)
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(segment.averageValue)}</div>
                      <div className="text-sm text-muted-foreground">
                        +{segment.growthRate}% growth
                      </div>
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
              <CardTitle>Booking Trends & Revenue</CardTitle>
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
                          {formatNumber(region.customers)} customers
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(region.revenue)}</div>
                      <div className="text-sm text-muted-foreground">
                        +{region.growth}% growth
                      </div>
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
                  <span>Repeat booking rate increased by 8% this period</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Customer satisfaction score improved to 8.7/10</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Business traveler segment showing strong growth</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-orange-600">Areas for Improvement</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <span>Customer churn rate increased by 2%</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <span>Occasional users segment showing low engagement</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <span>Geographic expansion needed in Midwest region</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
