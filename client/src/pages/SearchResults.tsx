import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilterBar from "@/components/FilterBar";
import SearchResultsLocalized from "@/components/SearchResultsLocalized";
import RegionTips from "@/components/RegionTips";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, List, Grid } from "lucide-react";
import type { ParkingLot } from "@shared/schema";

export default function SearchResults() {
  const [location, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState<any>({});

  // Parse search parameters from URL
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const airportCode = searchParams.get('airportCode') || 'LAX';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  const { data: parkingLots, isLoading, error } = useQuery<any[]>({
    queryKey: ['/api/parking/search', { airportCode, startDate, endDate, filters }],
    queryFn: async () => {
      const params = new URLSearchParams({
        airportCode,
        startDate,
        endDate,
        ...filters
      });
      const response = await fetch(`/api/parking/search?${params}`);
      if (!response.ok) {
        throw new Error('Failed to search parking');
      }
      return response.json();
    },
    enabled: !!airportCode && !!startDate && !!endDate,
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleBookNow = (lotId: string) => {
    // Navigate to booking flow with lot details
    const bookingParams = new URLSearchParams({
      lotId: lotId,
      startDate,
      endDate,
    });
    setLocation(`/booking?${bookingParams.toString()}`);
  };

  const calculatePrice = (lot: ParkingLot) => {
    // Simple pricing calculation - in real app this would come from pricing table
    const basePrices: Record<string, number> = {
      'premium': 24.99,
      'standard': 18.99,
      'economy': 12.99,
    };
    
    const lotType = lot.name.toLowerCase().includes('premium') ? 'premium' :
                   lot.name.toLowerCase().includes('economy') ? 'economy' : 'standard';
    
    return basePrices[lotType] || 18.99;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !parkingLots) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-dark mb-2">No results found</h3>
              <p className="text-neutral-dark mb-4">
                We couldn't find any parking options for {airportCode}. Please try a different airport or dates.
              </p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <FilterBar 
        onFilterChange={handleFilterChange}
        onToggleMapView={() => setShowMap(!showMap)}
        showMapView={showMap}
      />

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-neutral-dark">
              Available Parking near {airportCode}
            </h3>
            <p className="text-neutral-dark mt-1">
              Showing {parkingLots?.length || 0} parking options
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-neutral-dark">View:</span>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showMap && (
          <div className="mb-8">
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-dark mb-2">Map View</h3>
                <p className="text-neutral-dark">
                  Interactive map integration would be implemented here using Leaflet or similar mapping library.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <SearchResultsLocalized 
              lots={parkingLots || []} 
              onBooking={handleBookNow}
              isLoading={isLoading}
            />

            {parkingLots && parkingLots.length > 6 && (
              <div className="flex justify-center mt-12">
                <Button className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors">
                  Load More Results
                </Button>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <RegionTips className="sticky top-4" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
