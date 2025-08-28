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

// Extended interface for parking lot with pricing
interface ParkingLotWithPricing extends ParkingLot {
  pricing?: Array<{
    id: string;
    lotId: string;
    priceType: string;
    basePrice: string;
    currency: string;
    localizedPrice: string;
    taxRate: string;
    region: string;
    discountedPrice?: string;
    isActive: boolean;
    createdAt: Date;
  }>;
}

export default function SearchResults() {
  const [location, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState<any>({});

  // Parse search parameters from URL
  const searchParams = new URLSearchParams(window.location.search);
  const airportCode = searchParams.get('airportCode');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  console.log('🔍 SearchResults - Location:', location);
  console.log('🔍 SearchResults - Airport Code:', airportCode);
  console.log('🔍 SearchResults - Start Date:', startDate);
  console.log('🔍 SearchResults - End Date:', endDate);
  
  // Redirect to home if no search parameters
  useEffect(() => {
    console.log('🔍 SearchResults - useEffect triggered');
    console.log('🔍 SearchResults - Checking parameters:', { airportCode, startDate, endDate });
    
    // Temporarily disable redirect to test search functionality
    if (!airportCode || !startDate || !endDate) {
      console.log('🔍 SearchResults - Missing parameters but staying on page for testing');
      // setLocation('/'); // Commented out for testing
    } else {
      console.log('🔍 SearchResults - Parameters valid, staying on page');
    }
  }, [airportCode, startDate, endDate, setLocation]);

  const { data: parkingLots, isLoading, error, refetch } = useQuery<any[]>({
    queryKey: ['/api/parking/search', { airportCode, startDate, endDate, filters }],
    queryFn: async () => {
      console.log('🔍 SearchResults - useQuery executing');
      const params = new URLSearchParams({
        airportCode: airportCode || '',
        startDate: startDate || '',
        endDate: endDate || '',
        ...filters
      });
      const apiUrl = `/api/parking/search?${params}`;
      console.log('🔍 SearchResults - API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to search parking');
      }
      const data = await response.json();
      console.log('🔍 SearchResults - API response:', data.length, 'parking lots');
      return data;
    },
    enabled: true, // Always enable for testing
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (airportCode && startDate && endDate) {
      refetch();
    }
  }, [airportCode, startDate, endDate, refetch]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleBookNow = (lotId: string, pricing?: { localizedPrice: string; taxRate: string }) => {
    // Navigate to booking flow with lot details and pricing
    const bookingParams = new URLSearchParams({
      lotId,
      startDate: startDate || '',
      endDate: endDate || '',
    });
    
    // Add pricing information if available
    if (pricing) {
      bookingParams.set('pricePerDay', pricing.localizedPrice);
      bookingParams.set('taxRate', pricing.taxRate);
    }
    
    setLocation(`/booking?${bookingParams.toString()}`);
  };

  const calculatePrice = (lot: ParkingLotWithPricing) => {
    // Use dynamic pricing from the parking lot data if available
    if (lot.pricing && lot.pricing.length > 0) {
      // Find daily pricing
      const dailyPricing = lot.pricing.find((p: any) => p.priceType === 'daily');
      if (dailyPricing) {
        return parseFloat(dailyPricing.localizedPrice);
      }
    }
    
    // Fallback to a reasonable default if no pricing is available
    // This would be replaced by actual pricing API in production
    return 18.99;
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

  if (error) {
    console.log('🔍 SearchResults - Error occurred:', error);
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-dark mb-2">Error loading results</h3>
              <p className="text-neutral-dark mb-4">
                There was an error loading parking results. Please try again.
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

  if (!parkingLots || parkingLots.length === 0) {
    console.log('🔍 SearchResults - No parking lots found');
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-dark mb-2">No results found</h3>
              <p className="text-neutral-dark mb-4">
                We couldn't find any parking options for {airportCode || 'the selected airport'}. Please try a different airport or dates.
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
