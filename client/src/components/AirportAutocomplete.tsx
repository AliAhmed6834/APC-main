import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plane, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
}

interface AirportAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (airport: Airport) => void;
  placeholder?: string;
  className?: string;
}

export default function AirportAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Search airports (e.g., London, UK or Los Angeles, CA)",
  className = "",
}: AirportAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch airports based on search term
  const { data: airports = [], isLoading } = useQuery({
    queryKey: ["airports", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const response = await fetch(`/api/airports/search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error("Failed to fetch airports");
      return response.json();
    },
    enabled: searchTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('🔍 Input change:', newValue);
    setSearchTerm(newValue);
    
    // Clear selected airport if user is typing manually
    if (selectedAirport) {
      setSelectedAirport(null);
    }
    
    onChange(newValue);
    setIsOpen(true);
  };

  // Handle airport selection
  const handleSelect = (airport: Airport) => {
    console.log('🔍 Airport Selected:', airport);
    console.log('🔍 Airport Code:', airport.code);
    console.log('🔍 Airport City:', airport.city);
    
    if (!airport.code) {
      console.error('❌ Airport code is missing!');
      return;
    }
    
    // Set the selected airport to maintain display value
    setSelectedAirport(airport);
    
    // Call onChange with the airport code
    console.log('🔍 Calling onChange with:', airport.code);
    onChange(airport.code);
    
    // Call onSelect with the full airport object
    console.log('🔍 Calling onSelect with:', airport);
    onSelect(airport);
    
    setIsOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Track the selected airport to maintain display value
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);

  // Update searchTerm when value changes
  useEffect(() => {
    // If we have a selected airport, use its full location name
    if (selectedAirport) {
      const locationParts = [selectedAirport.city];
      if (selectedAirport.state && selectedAirport.state.trim()) {
        locationParts.push(selectedAirport.state);
      }
      locationParts.push(selectedAirport.country);
      const fullLocationName = locationParts.join(', ');
      setSearchTerm(`${fullLocationName} (${selectedAirport.code})`);
    } else {
      // Otherwise, use the value prop (for initial state or manual input)
      setSearchTerm(value || '');
    }
  }, [value, selectedAirport]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
        />
        <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && (searchTerm.length >= 2) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-sm">Searching airports...</p>
            </div>
          ) : airports.length > 0 ? (
            <div className="py-1">
              {airports.map((airport: Airport) => (
                <button
                  key={airport.id}
                  onClick={() => handleSelect(airport)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {airport.city}{airport.state && airport.state.trim() ? `, ${airport.state}` : ''}, {airport.country} ({airport.code})
                        </div>
                        <div className="text-sm text-gray-500">
                          {airport.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {airport.country}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No airports found</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
} 