import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Car, BarChart3, User, LogOut, Star, TrendingUp, Clock, Award } from "lucide-react";

// Custom interface for dashboard bookings that includes parking lot details
interface DashboardBooking {
  id: string;
  userId: string;
  lotId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  pricePerDay: string;
  totalAmount: string;
  status: string;
  bookingReference: string;
  createdAt: string;
  updatedAt: string;
  vehicleInfo?: any;
  specialRequests?: string;
  parkingLotDetails?: {
    name: string;
    address: string;
    airportId: string;
    airportName: string;
    distanceToTerminal: string;
    description: string;
    rating: string;
    isCovered: boolean;
    hasEvCharging: boolean;
    hasSecurityPatrol: boolean;
    hasCctv: boolean;
    isShuttleIncluded: boolean;
    shuttleFrequencyMinutes: number;
  };
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [recentBookings, setRecentBookings] = useState<DashboardBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userToken = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');

    if (!userToken || !userData) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access your dashboard.",
        variant: "destructive",
      });
      setLocation('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Fetch user's actual bookings from the API
      fetchUserBookings(parsedUser.id);
    } catch (error) {
      console.error('Error parsing user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data. Please log in again.",
        variant: "destructive",
      });
      setLocation('/login');
    }
  }, [setLocation, toast]);

  const fetchUserBookings = async (userId: string) => {
    try {
      const response = await fetch(`/api/customer/bookings?userId=${userId}`);

      if (response.ok) {
        const bookings = await response.json();
        // Transform the data to match our interface
        const transformedBookings: DashboardBooking[] = bookings.map((booking: any) => ({
          id: booking.id,
          userId: booking.userId,
          lotId: booking.lotId,
          startDate: new Date(booking.startDate).toLocaleDateString(),
          endDate: new Date(booking.endDate).toLocaleDateString(),
          totalDays: booking.totalDays,
          pricePerDay: booking.pricePerDay,
          totalAmount: booking.totalAmount,
          status: booking.status,
          bookingReference: booking.bookingReference,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          vehicleInfo: booking.vehicleInfo,
          specialRequests: booking.specialRequests,
          parkingLotDetails: booking.parkingLotDetails
        }));
        setRecentBookings(transformedBookings);
      } else {
        // If no bookings found or error, show empty state
        setRecentBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Show empty state on error
      setRecentBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    setLocation('/');
  };

  const handleBookNewParking = () => {
    setLocation('/');
  };

  // Calculate personal statistics
  const personalStats = {
    totalBookings: recentBookings.length,
    totalSpent: recentBookings.reduce((sum, booking) => sum + parseFloat(booking.totalAmount), 0),
    averageRating: 4.8, // Mock data - would come from reviews
    favoriteAirport: recentBookings.length > 0 ? 
      recentBookings.reduce((acc, booking) => {
        acc[booking.parkingLotDetails?.airportName || 'Unknown Airport'] = (acc[booking.parkingLotDetails?.airportName || 'Unknown Airport'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) : {},
    memberSince: "Today"
  };

  const getFavoriteAirport = () => {
    if (Object.keys(personalStats.favoriteAirport).length === 0) return "None yet";
    return Object.entries(personalStats.favoriteAirport)
      .sort(([,a], [,b]) => b - a)[0][0];
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* User Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening with your parking bookings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Signed in as</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Bookings */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Your Recent Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading your bookings...</p>
                    </div>
                  ) : recentBookings.length > 0 ? (
                    <div className="space-y-4">
                      {recentBookings.map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-primary mr-2" />
                              <span className="font-medium">
                                {booking.parkingLotDetails?.airportName || 'Unknown Airport'}
                              </span>
                            </div>
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {booking.parkingLotDetails?.name || 'Unknown Lot'}
                          </p>
                          <p className="text-sm text-gray-500 mb-2">
                            {booking.parkingLotDetails?.address || 'Unknown Address'}
                          </p>
                          {booking.parkingLotDetails?.distanceToTerminal && (
                            <p className="text-sm text-gray-500 mb-2">
                              {booking.parkingLotDetails.distanceToTerminal} from terminal
                            </p>
                          )}
                          <div className="flex items-center justify-between text-sm">
                            <span>
                              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            </span>
                            <span className="font-medium">${parseFloat(booking.totalAmount).toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-gray-500">
                              {booking.totalDays} day{booking.totalDays > 1 ? 's' : ''} • ${parseFloat(booking.pricePerDay).toFixed(2)}/day
                            </span>
                            <span className="text-xs text-gray-400">
                              Ref: {booking.bookingReference}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No bookings yet</p>
                      <p className="text-sm text-gray-500">Start by booking your first parking spot!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & User Info */}
            <div className="space-y-6">
              {/* User Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">{personalStats.memberSince}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" onClick={handleBookNewParking}>
                    <Car className="w-4 h-4 mr-2" />
                    Book New Parking
                  </Button>
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Personal Analytics Section */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Your Personal Analytics
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Insights about your parking habits and preferences
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Bookings */}
                  <div className="text-center p-4 border rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {personalStats.totalBookings}
                    </div>
                    <div className="text-sm text-gray-600">Total Bookings</div>
                  </div>

                  {/* Total Spent */}
                  <div className="text-center p-4 border rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      ${personalStats.totalSpent.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                  </div>

                  {/* Average Rating */}
                  <div className="text-center p-4 border rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {personalStats.averageRating}
                    </div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>

                  {/* Favorite Airport */}
                  <div className="text-center p-4 border rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {getFavoriteAirport()}
                    </div>
                    <div className="text-sm text-gray-600">Favorite Airport</div>
                  </div>
                </div>

                {/* Personal Insights */}
                {recentBookings.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Your Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Award className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="font-medium text-blue-900">Booking Pattern</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          You prefer {getFavoriteAirport()} airport for your travels.
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Clock className="w-5 h-5 text-green-600 mr-2" />
                          <span className="font-medium text-green-900">Average Stay</span>
                        </div>
                        <p className="text-sm text-green-700">
                          Your typical parking duration is 3-5 days.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State for New Users */}
                {recentBookings.length === 0 && (
                  <div className="mt-8 text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No analytics yet</p>
                    <p className="text-sm text-gray-500">
                      Start booking parking to see your personal insights and trends!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 