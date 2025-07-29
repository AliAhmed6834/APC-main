import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchForm from "@/components/SearchForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, Car } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "@/contexts/LocaleContext";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { formatPrice, t } = useLocale();

  const handleSearch = (data: any) => {
    // Navigate to search results with the search data
    const searchParams = new URLSearchParams({
      airportCode: data.airportCode,
      startDate: data.dropOffDate,
      endDate: data.pickUpDate,
      ...(data.promoCode && { promoCode: data.promoCode })
    });
    setLocation(`/search?${searchParams.toString()}`);
  };

  // Mock recent bookings data
  const recentBookings = [
    {
      id: "1",
      airportCode: "LAX",
      airportName: "Los Angeles International Airport",
      startDate: "2025-02-15",
      endDate: "2025-02-20",
      parkingLot: "LAX Premium Parking",
      price: 99.95,
      status: "confirmed"
    },
    {
      id: "2", 
      airportCode: "LHR",
      airportName: "London Heathrow Airport",
      startDate: "2025-03-01",
      endDate: "2025-03-05",
      parkingLot: "LHR Terminal 5 Car Park",
      price: 79.96,
      status: "confirmed"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {(user as any)?.firstName || 'User'}!
            </h1>
            <p className="text-gray-600">
              Ready to find your next airport parking spot?
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Search */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    Quick Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SearchForm onSearch={handleSearch} />
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Recent Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-primary mr-2" />
                            <span className="font-medium">{booking.airportCode}</span>
                          </div>
                          <span className="text-sm text-green-600 font-medium">
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {booking.airportName}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {booking.parkingLot}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-1" />
                            <span>
                              {booking.startDate} - {booking.endDate}
                            </span>
                          </div>
                          <span className="font-medium">
                            {formatPrice(booking.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
