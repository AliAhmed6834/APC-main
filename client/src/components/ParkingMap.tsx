import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  MapPin, 
  Navigation, 
  Car, 
  Clock, 
  Star, 
  DollarSign, 
  Filter,
  ZoomIn,
  ZoomOut,
  Layers,
  Compass,
  Route
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface ParkingLot {
  id: string;
  name: string;
  supplier: string;
  distance: number;
  price: number;
  rating: number;
  availableSpots: number;
  totalSpots: number;
  amenities: string[];
  coordinates: [number, number];
  address: string;
  estimatedTime: number;
  isOpen: boolean;
  instantBooking: boolean;
  freeCancellation: boolean;
}

interface ParkingMapProps {
  parkingLots: ParkingLot[];
  userLocation?: [number, number];
  onLotSelect: (lot: ParkingLot) => void;
  onDirections: (destination: [number, number]) => void;
  className?: string;
}

interface MapView {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}

export function ParkingMap({ 
  parkingLots, 
  userLocation, 
  onLotSelect, 
  onDirections,
  className = '' 
}: ParkingMapProps) {
  const { toast } = useToast();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  const [mapView, setMapView] = useState<MapView>({
    center: userLocation || [34.0522, -118.2437], // Default to LA
    zoom: 12,
    bearing: 0,
    pitch: 0
  });
  
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [mapLayers, setMapLayers] = useState({
    showTraffic: false,
    showTransit: false,
    showSatellite: false,
    showParkingLots: true,
    showUserLocation: true
  });
  const [searchRadius, setSearchRadius] = useState(10);
  const [priceFilter, setPriceFilter] = useState<[number, number]>([0, 100]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize map when component mounts
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      initializeMap();
    }
  }, []);

  // Update map when parking lots change
  useEffect(() => {
    if (mapRef.current && parkingLots.length > 0) {
      updateMapMarkers();
    }
  }, [parkingLots]);

  // Update user location
  useEffect(() => {
    if (userLocation && mapRef.current) {
      updateUserLocation();
    }
  }, [userLocation]);

  const initializeMap = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if Mapbox is available
      if (typeof window.mapboxgl === 'undefined') {
        // Load Mapbox GL JS dynamically
        await loadMapboxScript();
      }

      const mapboxgl = window.mapboxgl;
      
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: mapView.center,
        zoom: mapView.zoom,
        bearing: mapView.bearing,
        pitch: mapView.pitch,
        accessToken: process.env.REACT_APP_MAPBOX_TOKEN || 'your-mapbox-token'
      });

      // Add navigation controls
      mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add geolocate control
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      });
      mapRef.current.addControl(geolocateControl, 'top-right');

      // Add map event listeners
      mapRef.current.on('load', () => {
        setIsLoading(false);
        updateMapMarkers();
      });

      mapRef.current.on('click', (e: any) => {
        const features = mapRef.current.queryRenderedFeatures(e.point, {
          layers: ['parking-lots']
        });
        
        if (features.length > 0) {
          const lotId = features[0].properties?.id;
          const lot = parkingLots.find(l => l.id === lotId);
          if (lot) {
            setSelectedLot(lot);
            onLotSelect(lot);
          }
        } else {
          setSelectedLot(null);
        }
      });

      // Add custom map style for parking lots
      mapRef.current.on('style.load', () => {
        if (mapRef.current.getSource('parking-lots')) {
          mapRef.current.removeSource('parking-lots');
        }
        
        mapRef.current.addSource('parking-lots', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: parkingLots.map(lot => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: lot.coordinates
              },
              properties: {
                id: lot.id,
                name: lot.name,
                price: lot.price,
                rating: lot.rating,
                availableSpots: lot.availableSpots
              }
            }))
          }
        });

        // Add parking lot layer
        mapRef.current.addLayer({
          id: 'parking-lots',
          type: 'circle',
          source: 'parking-lots',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'availableSpots'],
              0, 8,
              100, 20
            ],
            'circle-color': [
              'case',
              ['<', ['get', 'availableSpots'], 10], '#ef4444', // Red for low availability
              ['<', ['get', 'availableSpots'], 30], '#f59e0b', // Orange for medium
              '#10b981' // Green for high availability
            ],
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Add hover effect
        mapRef.current.on('mouseenter', 'parking-lots', () => {
          mapRef.current.getCanvas().style.cursor = 'pointer';
        });

        mapRef.current.on('mouseleave', 'parking-lots', () => {
          mapRef.current.getCanvas().style.cursor = '';
        });
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setIsLoading(false);
      toast({
        title: "Map Error",
        description: "Failed to load the map. Please refresh the page.",
        variant: "destructive"
      });
    }
  }, []);

  const loadMapboxScript = async () => {
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.1/mapbox-gl.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Mapbox'));
      document.head.appendChild(script);
      
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.1/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    });
  };

  const updateMapMarkers = useCallback(() => {
    if (!mapRef.current || !parkingLots.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    parkingLots.forEach(lot => {
      const el = document.createElement('div');
      el.className = 'parking-marker';
      el.innerHTML = `
        <div class="marker-content">
          <div class="marker-price">$${lot.price}</div>
          <div class="marker-rating">${lot.rating}★</div>
        </div>
      `;

      const marker = new window.mapboxgl.Marker(el)
        .setLngLat(lot.coordinates)
        .addTo(mapRef.current);

      marker.getElement().addEventListener('click', () => {
        setSelectedLot(lot);
        onLotSelect(lot);
        flyToLocation(lot.coordinates);
      });

      markersRef.current.push(marker);
    });
  }, [parkingLots, onLotSelect]);

  const updateUserLocation = useCallback(() => {
    if (!mapRef.current || !userLocation) return;
    
    // Fly to user location
    flyToLocation(userLocation);
    
    // Add user location marker if not exists
    if (mapLayers.showUserLocation) {
      const userMarker = new window.mapboxgl.Marker({
        color: '#3b82f6',
        element: createUserLocationMarker()
      })
        .setLngLat(userLocation)
        .addTo(mapRef.current);
      
      markersRef.current.push(userMarker);
    }
  }, [userLocation, mapLayers.showUserLocation]);

  const createUserLocationMarker = () => {
    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.innerHTML = `
      <div class="user-marker-content">
        <div class="user-marker-dot"></div>
        <div class="user-marker-pulse"></div>
      </div>
    `;
    return el;
  };

  const flyToLocation = useCallback((coordinates: [number, number]) => {
    if (!mapRef.current) return;
    
    mapRef.current.flyTo({
      center: coordinates,
      zoom: 15,
      duration: 2000
    });
  }, []);

  const handleDirections = useCallback((destination: [number, number]) => {
    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "Please enable location access to get directions.",
        variant: "destructive"
      });
      return;
    }
    
    onDirections(destination);
    
    // Open directions in new tab with Google Maps
    const url = `https://www.google.com/maps/dir/${userLocation[0]},${userLocation[1]}/${destination[0]},${destination[1]}`;
    window.open(url, '_blank');
  }, [userLocation, onDirections]);

  const handleMapStyleChange = useCallback((style: string) => {
    if (!mapRef.current) return;
    
    const styleUrls = {
      streets: 'mapbox://styles/mapbox/streets-v11',
      satellite: 'mapbox://styles/mapbox/satellite-v9',
      dark: 'mapbox://styles/mapbox/dark-v10',
      light: 'mapbox://styles/mapbox/light-v10'
    };
    
    mapRef.current.setStyle(styleUrls[style as keyof typeof styleUrls]);
  }, []);

  const filteredLots = parkingLots.filter(lot => {
    const withinRadius = lot.distance <= searchRadius;
    const withinPrice = lot.price >= priceFilter[0] && lot.price <= priceFilter[1];
    const meetsRating = lot.rating >= ratingFilter;
    
    return withinRadius && withinPrice && meetsRating;
  });

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleCompassReset = () => {
    if (mapRef.current) {
      mapRef.current.easeTo({
        bearing: 0,
        pitch: 0,
        duration: 1000
      });
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading map...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Select onValueChange={handleMapStyleChange} defaultValue="streets">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="streets">Streets</SelectItem>
              <SelectItem value="satellite">Satellite</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCompassReset}
          >
            <Compass className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm">Search Radius (miles)</Label>
                <Input
                  type="number"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  min="1"
                  max="50"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Min Price</Label>
                <Input
                  type="number"
                  value={priceFilter[0]}
                  onChange={(e) => setPriceFilter([Number(e.target.value), priceFilter[1]])}
                  min="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Max Price</Label>
                <Input
                  type="number"
                  value={priceFilter[1]}
                  onChange={(e) => setPriceFilter([priceFilter[0], Number(e.target.value)])}
                  min="0"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">Minimum Rating</Label>
              <div className="flex items-center space-x-2 mt-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant={ratingFilter >= rating ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRatingFilter(ratingFilter === rating ? 0 : rating)}
                    className="h-8 w-8 p-0"
                  >
                    {rating}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Container */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Parking Map
            <Badge variant="secondary">{filteredLots.length} lots found</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div 
            ref={mapContainerRef} 
            className="w-full h-96 rounded-b-lg"
            style={{ minHeight: '400px' }}
          />
        </CardContent>
      </Card>

      {/* Selected Lot Details */}
      {selectedLot && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{selectedLot.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium">${selectedLot.price}/day</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{selectedLot.rating} stars</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-blue-600" />
                <span>{selectedLot.availableSpots} spots available</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span>{selectedLot.estimatedTime} min walk</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">{selectedLot.supplier}</Badge>
              {selectedLot.instantBooking && (
                <Badge variant="default">Instant Booking</Badge>
              )}
              {selectedLot.freeCancellation && (
                <Badge variant="secondary">Free Cancellation</Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => onLotSelect(selectedLot)}
                className="flex-1"
              >
                View Details
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDirections(selectedLot.coordinates)}
                className="flex items-center gap-2"
              >
                <Navigation className="h-4 w-4" />
                Directions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Low availability (&lt;10 spots)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Medium availability (10-30 spots)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>High availability (&gt;30 spots)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom CSS for markers */}
      <style jsx>{`
        .parking-marker {
          cursor: pointer;
        }
        
        .marker-content {
          background: white;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        .marker-price {
          color: #059669;
          line-height: 1;
        }
        
        .marker-rating {
          color: #d97706;
          line-height: 1;
        }
        
        .user-location-marker {
          position: relative;
        }
        
        .user-marker-content {
          position: relative;
          width: 20px;
          height: 20px;
        }
        
        .user-marker-dot {
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          position: absolute;
          top: 0;
          left: 0;
        }
        
        .user-marker-pulse {
          width: 20px;
          height: 20px;
          background: rgba(59, 130, 246, 0.3);
          border-radius: 50%;
          position: absolute;
          top: 0;
          left: 0;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Extend Window interface for Mapbox
declare global {
  interface Window {
    mapboxgl: any;
  }
}
