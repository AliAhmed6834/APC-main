import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  Bus, 
  Shield, 
  Zap, 
  Camera, 
  UmbrellaOff,
  Car,
  Star,
  StarIcon
} from "lucide-react";
import type { ParkingLot } from "@shared/schema";

interface ParkingCardProps {
  lot: ParkingLot;
  pricePerDay?: number;
  originalPrice?: number;
  onViewDetails?: () => void;
  onBookNow?: () => void;
}

export default function ParkingCard({ 
  lot, 
  pricePerDay = 19.99, 
  originalPrice,
  onViewDetails, 
  onBookNow 
}: ParkingCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-accent text-accent" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarIcon key="half" className="w-4 h-4 text-accent" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return stars;
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'shuttle':
        return <Bus className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'ev-charging':
        return <Zap className="w-4 h-4" />;
      case 'cctv':
        return <Camera className="w-4 h-4" />;
      case 'covered':
        return <UmbrellaOff className="w-4 h-4" />;
      case 'car-wash':
        return <Car className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const amenities = [];
  if (lot.isShuttleIncluded) amenities.push({ key: 'shuttle', label: `Bus every ${lot.shuttleFrequencyMinutes} min` });
  if (lot.hasSecurityPatrol) amenities.push({ key: 'security', label: 'Security Patrol' });
  if (lot.hasEvCharging) amenities.push({ key: 'ev-charging', label: 'EV Charging' });
  if (lot.hasCctv) amenities.push({ key: 'cctv', label: '24/7 Surveillance' });
  if (lot.isCovered) amenities.push({ key: 'covered', label: 'Covered' });
  if (lot.hasCarWash) amenities.push({ key: 'car-wash', label: 'Car Wash Available' });

  const getBadges = () => {
    const badges = [];
    
    if (pricePerDay < 15) {
      badges.push(<Badge key="lowest" className="bg-green-500 text-white">LOWEST PRICE</Badge>);
    } else if (pricePerDay < 20) {
      badges.push(<Badge key="value" className="bg-secondary text-primary">BEST VALUE</Badge>);
    }
    
    if (lot.distanceToTerminal && parseFloat(lot.distanceToTerminal) < 0.5) {
      badges.push(<Badge key="closest" className="bg-primary text-white">CLOSEST</Badge>);
    }
    
    if (lot.isCovered) {
      badges.push(<Badge key="premium" className="bg-blue-100 text-blue-800">Premium Service</Badge>);
    }
    
    badges.push(<Badge key="cancellation" className="bg-green-100 text-green-800">Free Cancellation</Badge>);
    
    return badges;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <img 
            src={lot.imageUrl || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?ixlib=rb-4.0.3&w=400&h=300&fit=crop"}
            alt={`${lot.name} facility`} 
            className="w-full lg:w-48 h-48 object-cover rounded-lg"
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-semibold text-neutral-dark">{lot.name}</h4>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {lot.rating && renderStars(parseFloat(lot.rating))}
                  </div>
                  <span className="ml-2 text-sm text-neutral-dark">
                    {lot.rating} ({lot.reviewCount} reviews)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">${pricePerDay}</div>
                <div className="text-sm text-neutral-dark">per day</div>
                {originalPrice && (
                  <div className="text-xs text-secondary line-through">${originalPrice}</div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
              <div className="flex items-center text-neutral-dark">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{lot.distanceToTerminal} miles to terminal</span>
              </div>
              {amenities.slice(0, 3).map((amenity) => (
                <div key={amenity.key} className="flex items-center text-secondary">
                  {getAmenityIcon(amenity.key)}
                  <span className="ml-1">{amenity.label}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getBadges().slice(0, 2)}
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  className="text-primary hover:text-secondary font-medium text-sm"
                  onClick={onViewDetails}
                >
                  View Details
                </Button>
                <Button 
                  className="bg-accent text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                  onClick={onBookNow}
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
