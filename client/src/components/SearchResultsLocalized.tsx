import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Star, 
  Zap, 
  Car as CarIcon, 
  Shield, 
  Droplets,
  Camera
} from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import PriceDisplay, { TaxInfo } from '@/components/PriceDisplay';
import { useDistance } from '@/hooks/useGeoAware';

interface LocalizedParkingLot {
  id: string;
  name: string;
  description?: string;
  address: string;
  distanceToTerminal?: string;
  distanceFormatted?: string;
  shuttleFrequencyMinutes?: number;
  isShuttleIncluded?: boolean;
  isCovered?: boolean;
  hasEvCharging?: boolean;
  hasCarWash?: boolean;
  hasSecurityPatrol?: boolean;
  hasCctv?: boolean;
  imageUrl?: string;
  rating?: string;
  reviewCount?: number;
  currency?: string;
  region?: string;
  locale?: string;
  pricing?: {
    localizedPrice: string;
    currency: string;
    taxRate: string;
  };
}

interface SearchResultsLocalizedProps {
  lots: LocalizedParkingLot[];
  onBooking: (lotId: string, pricing?: { localizedPrice: string; taxRate: string }) => void;
  isLoading?: boolean;
}

export default function SearchResultsLocalized({ 
  lots, 
  onBooking, 
  isLoading = false 
}: SearchResultsLocalizedProps) {
  const { t, formatPrice, region } = useLocale();
  const { formatDistance } = useDistance();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (lots.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <CarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {t('parking_lot')}s found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or dates.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {lots.map((lot) => (
        <Card key={lot.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{lot.name}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {lot.distanceFormatted || 
                     formatDistance(parseFloat(lot.distanceToTerminal || '0'))}
                    <span className="ml-1">from terminal</span>
                  </div>
                  {lot.rating && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                      {lot.rating} ({lot.reviewCount} reviews)
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                {lot.pricing ? (
                  <div>
                    <PriceDisplay 
                      amount={parseFloat(lot.pricing.localizedPrice)} 
                      className="text-2xl font-bold text-primary"
                    />
                    <TaxInfo 
                      region={region} 
                      amount={parseFloat(lot.pricing.localizedPrice)}
                      className="block"
                    />
                  </div>
                ) : (
                  <div className="text-lg font-semibold text-gray-500">
                    Price on request
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {lot.imageUrl && (
                  <img 
                    src={lot.imageUrl} 
                    alt={lot.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <p className="text-gray-600 mb-4">{lot.description}</p>
                <p className="text-sm text-gray-500">{lot.address}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Amenities</h4>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {lot.isShuttleIncluded && (
                    <Badge variant="secondary" className="flex items-center justify-start">
                      <CarIcon className="w-3 h-3 mr-1" />
                      {region === 'GB' ? 'Shuttle included' : 'Shuttle included'}
                    </Badge>
                  )}
                  {lot.isCovered && (
                    <Badge variant="secondary" className="flex items-center justify-start">
                      <Shield className="w-3 h-3 mr-1" />
                      {t('features.covered') || 'Covered'}
                    </Badge>
                  )}
                  {lot.hasEvCharging && (
                    <Badge variant="secondary" className="flex items-center justify-start">
                      <Zap className="w-3 h-3 mr-1" />
                      EV Charging
                    </Badge>
                  )}
                  {lot.hasCarWash && (
                    <Badge variant="secondary" className="flex items-center justify-start">
                      <Droplets className="w-3 h-3 mr-1" />
                      Car Wash
                    </Badge>
                  )}
                  {lot.hasSecurityPatrol && (
                    <Badge variant="secondary" className="flex items-center justify-start">
                      <Shield className="w-3 h-3 mr-1" />
                      Security Patrol
                    </Badge>
                  )}
                  {lot.hasCctv && (
                    <Badge variant="secondary" className="flex items-center justify-start">
                      <Camera className="w-3 h-3 mr-1" />
                      CCTV
                    </Badge>
                  )}
                </div>
                
                {lot.shuttleFrequencyMinutes && (
                  <p className="text-sm text-gray-600 mb-4">
                    Shuttle every {lot.shuttleFrequencyMinutes} minutes
                  </p>
                )}
                
                <Button 
                  onClick={() => onBooking(lot.id, lot.pricing)}
                  className="w-full"
                  size="lg"
                >
                  {region === 'GB' ? 'Book Now' : 'Reserve Now'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}