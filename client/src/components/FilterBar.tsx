import { useState } from "react";
import { ChevronDown, Map, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FilterBarProps {
  onFilterChange?: (filters: any) => void;
  onToggleMapView?: () => void;
  showMapView?: boolean;
}

export default function FilterBar({ onFilterChange, onToggleMapView, showMapView }: FilterBarProps) {
  const [priceRange, setPriceRange] = useState([5, 50]);
  const [sortBy, setSortBy] = useState("price-low");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const updatedAmenities = checked 
      ? [...amenities, amenity]
      : amenities.filter(a => a !== amenity);
    
    setAmenities(updatedAmenities);
    
    if (onFilterChange) {
      onFilterChange({
        sortBy,
        priceRange,
        amenities: updatedAmenities,
      });
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    if (onFilterChange) {
      onFilterChange({
        sortBy: value,
        priceRange,
        amenities,
      });
    }
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
    if (onFilterChange) {
      onFilterChange({
        sortBy,
        priceRange: value,
        amenities,
      });
    }
  };

  return (
    <section className="bg-neutral-light border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                  <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4">
                <MobileFilters 
                  sortBy={sortBy}
                  priceRange={priceRange}
                  amenities={amenities}
                  onSortChange={handleSortChange}
                  onPriceRangeChange={handlePriceRangeChange}
                  onAmenityChange={handleAmenityChange}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:flex flex-wrap items-center gap-4 flex-1">
            <span className="font-medium text-neutral-dark">Filter by:</span>
            
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="distance">Distance to Terminal</SelectItem>
                <SelectItem value="rating">Customer Rating</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-dark">Price:</span>
              <div className="w-32">
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  max={100}
                  min={5}
                  step={5}
                  className="accent-secondary"
                />
              </div>
              <span className="text-sm text-neutral-dark">
                ${priceRange[0]}-${priceRange[1]}/day
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="shuttle" 
                  checked={amenities.includes('shuttle')}
                  onCheckedChange={(checked) => handleAmenityChange('shuttle', !!checked)}
                />
                <Label htmlFor="shuttle" className="text-sm">Shuttle Service</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="covered" 
                  checked={amenities.includes('covered')}
                  onCheckedChange={(checked) => handleAmenityChange('covered', !!checked)}
                />
                <Label htmlFor="covered" className="text-sm">Covered Parking</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ev-charging" 
                  checked={amenities.includes('ev-charging')}
                  onCheckedChange={(checked) => handleAmenityChange('ev-charging', !!checked)}
                />
                <Label htmlFor="ev-charging" className="text-sm">EV Charging</Label>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={onToggleMapView}
            className={`${showMapView ? 'bg-primary' : 'bg-primary/10 text-primary'} hover:bg-primary/90 transition-colors`}
          >
            <Map className="mr-2 h-4 w-4" />
            {showMapView ? 'List View' : 'Map View'}
          </Button>
        </div>
      </div>
    </section>
  );
}

interface MobileFiltersProps {
  sortBy: string;
  priceRange: number[];
  amenities: string[];
  onSortChange: (value: string) => void;
  onPriceRangeChange: (value: number[]) => void;
  onAmenityChange: (amenity: string, checked: boolean) => void;
}

function MobileFilters({ 
  sortBy, 
  priceRange, 
  amenities, 
  onSortChange, 
  onPriceRangeChange, 
  onAmenityChange 
}: MobileFiltersProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">Sort by</Label>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="distance">Distance to Terminal</SelectItem>
            <SelectItem value="rating">Customer Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">
          Price Range: ${priceRange[0]}-${priceRange[1]}/day
        </Label>
        <Slider
          value={priceRange}
          onValueChange={onPriceRangeChange}
          max={100}
          min={5}
          step={5}
          className="accent-secondary"
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Amenities</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="mobile-shuttle" 
              checked={amenities.includes('shuttle')}
              onCheckedChange={(checked) => onAmenityChange('shuttle', !!checked)}
            />
            <Label htmlFor="mobile-shuttle" className="text-sm">Shuttle Service</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="mobile-covered" 
              checked={amenities.includes('covered')}
              onCheckedChange={(checked) => onAmenityChange('covered', !!checked)}
            />
            <Label htmlFor="mobile-covered" className="text-sm">Covered Parking</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="mobile-ev-charging" 
              checked={amenities.includes('ev-charging')}
              onCheckedChange={(checked) => onAmenityChange('ev-charging', !!checked)}
            />
            <Label htmlFor="mobile-ev-charging" className="text-sm">EV Charging</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
