import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { X, Filter, MapPin, Car, Clock, Star, DollarSign } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  className?: string;
}

export interface SearchFilters {
  priceRange: [number, number];
  maxDistance: number;
  amenities: string[];
  parkingType: string[];
  securityFeatures: string[];
  accessibility: string[];
  timeSlots: string[];
  rating: number;
  instantBooking: boolean;
  freeCancellation: boolean;
  shuttleService: boolean;
  coveredParking: boolean;
  evCharging: boolean;
  valetService: boolean;
  carWash: boolean;
  maxWalkTime: number;
  supplierRating: number;
  pricePerHour: [number, number];
  pricePerDay: [number, number];
  specialOffers: boolean;
  loyaltyDiscount: boolean;
}

const AMENITIES_OPTIONS = [
  { id: 'shuttle', label: 'Shuttle Service', icon: Car },
  { id: 'covered', label: 'Covered Parking', icon: Car },
  { id: 'ev_charging', label: 'EV Charging', icon: Car },
  { id: 'valet', label: 'Valet Service', icon: Car },
  { id: 'car_wash', label: 'Car Wash', icon: Car },
  { id: 'security', label: '24/7 Security', icon: Star },
  { id: 'cctv', label: 'CCTV Monitoring', icon: Star },
  { id: 'lighting', label: 'Well Lit', icon: Star },
  { id: 'fencing', label: 'Secure Fencing', icon: Star },
  { id: 'accessibility', label: 'Disabled Access', icon: Star },
  { id: 'family', label: 'Family Friendly', icon: Star },
  { id: 'business', label: 'Business Center', icon: Star },
];

const PARKING_TYPES = [
  'Short-term', 'Long-term', 'Economy', 'Premium', 'Valet', 'Self-park'
];

const TIME_SLOTS = [
  'Early Morning (4AM-8AM)', 'Morning (8AM-12PM)', 'Afternoon (12PM-4PM)',
  'Evening (4PM-8PM)', 'Late Night (8PM-12AM)', 'Overnight (12AM-4AM)'
];

export function AdvancedSearchFilters({ 
  onFiltersChange, 
  initialFilters, 
  className = '' 
}: AdvancedFiltersProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 100],
    maxDistance: 10,
    amenities: [],
    parkingType: [],
    securityFeatures: [],
    accessibility: [],
    timeSlots: [],
    rating: 0,
    instantBooking: false,
    freeCancellation: false,
    shuttleService: false,
    coveredParking: false,
    evCharging: false,
    valetService: false,
    carWash: false,
    maxWalkTime: 15,
    supplierRating: 0,
    pricePerHour: [0, 50],
    pricePerDay: [0, 200],
    specialOffers: false,
    loyaltyDiscount: false,
    ...initialFilters
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    const count = Object.values(filters).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value > 0;
      return false;
    }).length;
    setActiveFiltersCount(count);
  }, [filters]);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleParkingTypeToggle = (type: string) => {
    setFilters(prev => ({
      ...prev,
      parkingType: prev.parkingType.includes(type)
        ? prev.parkingType.filter(t => t !== type)
        : [...prev.parkingType, type]
    }));
  };

  const handleTimeSlotToggle = (slot: string) => {
    setFilters(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(slot)
        ? prev.timeSlots.filter(s => s !== slot)
        : [...prev.timeSlots, slot]
    }));
  };

  const clearAllFilters = () => {
    const defaultFilters: SearchFilters = {
      priceRange: [0, 100],
      maxDistance: 10,
      amenities: [],
      parkingType: [],
      securityFeatures: [],
      accessibility: [],
      timeSlots: [],
      rating: 0,
      instantBooking: false,
      freeCancellation: false,
      shuttleService: false,
      coveredParking: false,
      evCharging: false,
      valetService: false,
      carWash: false,
      maxWalkTime: 15,
      supplierRating: 0,
      pricePerHour: [0, 50],
      pricePerDay: [0, 200],
      specialOffers: false,
      loyaltyDiscount: false,
    };
    setFilters(defaultFilters);
    toast({
      title: "Filters Cleared",
      description: "All search filters have been reset to default values.",
    });
  };

  const formatPrice = (value: number) => `$${value}`;
  const formatDistance = (value: number) => `${value} miles`;
  const formatTime = (value: number) => `${value} min`;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Advanced Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {isExpanded ? 'Hide' : 'Show'}
        </span>
      </Button>

      {isExpanded && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Advanced Search Filters</CardTitle>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Price Range (per day)</Label>
              <div className="px-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => handleFilterChange('priceRange', value)}
                  max={200}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatPrice(filters.priceRange[0])}</span>
                  <span>{formatPrice(filters.priceRange[1])}</span>
                </div>
              </div>
            </div>

            {/* Distance */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Maximum Distance from Airport</Label>
              <div className="px-2">
                <Slider
                  value={[filters.maxDistance]}
                  onValueChange={(value) => handleFilterChange('maxDistance', value[0])}
                  max={25}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground mt-1">
                  {formatDistance(filters.maxDistance)}
                </div>
              </div>
            </div>

            {/* Walk Time */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Maximum Walk Time to Terminal</Label>
              <div className="px-2">
                <Slider
                  value={[filters.maxWalkTime]}
                  onValueChange={(value) => handleFilterChange('maxWalkTime', value[0])}
                  max={30}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground mt-1">
                  {formatTime(filters.maxWalkTime)}
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Minimum Rating</Label>
              <div className="px-2">
                <Slider
                  value={[filters.rating]}
                  onValueChange={(value) => handleFilterChange('rating', value[0])}
                  max={5}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground mt-1">
                  {filters.rating > 0 ? `${filters.rating}+ stars` : 'Any rating'}
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Amenities</Label>
              <div className="grid grid-cols-2 gap-3">
                {AMENITIES_OPTIONS.map((amenity) => {
                  const Icon = amenity.icon;
                  return (
                    <div key={amenity.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity.id}
                        checked={filters.amenities.includes(amenity.id)}
                        onCheckedChange={() => handleAmenityToggle(amenity.id)}
                      />
                      <Label htmlFor={amenity.id} className="text-sm flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        {amenity.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Parking Types */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Parking Types</Label>
              <div className="grid grid-cols-2 gap-3">
                {PARKING_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={filters.parkingType.includes(type)}
                      onCheckedChange={() => handleParkingTypeToggle(type)}
                    />
                    <Label htmlFor={type} className="text-sm">{type}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Preferred Time Slots</Label>
              <div className="grid grid-cols-1 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <div key={slot} className="flex items-center space-x-2">
                    <Checkbox
                      id={slot}
                      checked={filters.timeSlots.includes(slot)}
                      onCheckedChange={() => handleTimeSlotToggle(slot)}
                    />
                    <Label htmlFor={slot} className="text-sm">{slot}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Toggles */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quick Options</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="instant-booking"
                    checked={filters.instantBooking}
                    onCheckedChange={(checked) => handleFilterChange('instantBooking', checked)}
                  />
                  <Label htmlFor="instant-booking" className="text-sm">Instant Booking</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="free-cancellation"
                    checked={filters.freeCancellation}
                    onCheckedChange={(checked) => handleFilterChange('freeCancellation', checked)}
                  />
                  <Label htmlFor="free-cancellation" className="text-sm">Free Cancellation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="special-offers"
                    checked={filters.specialOffers}
                    onCheckedChange={(checked) => handleFilterChange('specialOffers', checked)}
                  />
                  <Label htmlFor="special-offers" className="text-sm">Special Offers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="loyalty-discount"
                    checked={filters.loyaltyDiscount}
                    onCheckedChange={(checked) => handleFilterChange('loyaltyDiscount', checked)}
                  />
                  <Label htmlFor="loyalty-discount" className="text-sm">Loyalty Discount</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
